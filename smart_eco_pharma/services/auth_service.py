"""Authentication flows built on Supabase Auth + email verification codes.

Exposes the four steps of the signup / password-reset flows:

+---------------------+------------------------------------------------------+
| Endpoint            | Responsibility                                       |
+---------------------+------------------------------------------------------+
| request_signup_code | check email is free, e-mail a fresh 8-digit code     |
| verify_signup_code  | validate the code, then create the Supabase user     |
| request_reset_code  | e-mail a fresh 8-digit code (anti-enumeration)       |
| verify_password_reset | validate the code, then set the new password       |
+---------------------+------------------------------------------------------+

Codes are stored *hashed* (SHA-256) with a short TTL and a failed-attempt cap.
All Supabase admin operations (create user / update password / lookup) go
through the GoTrue admin REST API with the service-role key — the same key the
rest of the backend already uses via ``database.service_client``.
"""

from __future__ import annotations

import hashlib
import logging
import re
import secrets
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import HTTPException, status

from ..config import settings
from ..database import service_client
from ..models.authentication import (
    AuthCodeResponse,
    AuthVerificationResponse,
    VerifyResetRequest,
    VerifySignupRequest,
)
from . import mailer

logger = logging.getLogger(__name__)

# Stable error codes the frontend matches on.
CODE_EMAIL_EXISTS = "EMAIL_EXISTS"
CODE_INVALID = "INVALID_OR_EXPIRED_CODE"
CODE_TOO_MANY = "TOO_MANY_ATTEMPTS"
CODE_RESEND_TOO_SOON = "RESEND_TOO_SOON"
CODE_WEAK_PASSWORD = "WEAK_PASSWORD"
CODE_ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND"
CODE_SEND_FAILED = "CODE_SEND_FAILED"

_MIN_LENGTH = 12
_PASSWORD_RULES: list[tuple[str, re.Pattern[str], str]] = [
    ("Length", re.compile(r".{12,}"), "at least 12 characters"),
    ("Upper", re.compile(r"[A-Z]"), "one uppercase letter"),
    ("Lower", re.compile(r"[a-z]"), "one lowercase letter"),
    ("Digit", re.compile(r"[0-9]"), "one number"),
    ("Symbol", re.compile(r"[^A-Za-z0-9]"), "one special character"),
]


def validate_password_strength(password: str) -> None:
    """Raise 422 WEAK_PASSWORD unless the password satisfies every rule."""
    missing = [label for label, pattern, _ in _PASSWORD_RULES if not pattern.search(password)]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"{CODE_WEAK_PASSWORD}: missing {', '.join(missing).lower()}",
        )


class EmailAlreadyExistsError(Exception):
    """Raised when the requested email already has a Supabase account."""


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode("utf-8")).hexdigest()


def _new_code() -> str:
    return f"{secrets.randbelow(10**8):08d}"


def _mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    visible = local[:2] if len(local) > 2 else local[:1]
    return f"{visible}{'*' * max(0, len(local) - len(visible))}@{domain}"


def _display_name(first_name: str, last_name: str) -> str:
    return f"{first_name} {last_name}".strip() or "Pharmacist"


def _parse_dt(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


class AuthService:
    # ── Supabase Auth admin (GoTrue REST, service-role key) ──────────

    @staticmethod
    def _admin_headers() -> dict[str, str]:
        key = settings.SUPABASE_SERVICE_ROLE_KEY
        return {"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}

    def _admin_request(self, method: str, path: str, *, json_body: dict | None = None) -> httpx.Response:
        url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/admin{path}"
        with httpx.Client(timeout=15.0) as client:
            return client.request(method, url, headers=self._admin_headers(), json=json_body)

    def email_exists(self, email: str) -> bool:
        """Page through admin users looking for ``email`` (lower-cased)."""
        target = email.strip().lower()
        for page in range(1, 6):  # safety cap — 200 users/page
            resp = self._admin_request("GET", f"/users?per_page=200&page={page}")
            resp.raise_for_status()
            users = resp.json().get("users", [])
            if any(u.get("email", "").lower() == target for u in users):
                return True
            if len(users) < 200:
                return False
        return False

    def create_user(self, email: str, password: str, first_name: str, last_name: str) -> str:
        """Create a *confirmed* Supabase account (no confirmation email sent by Supabase)."""
        resp = self._admin_request(
            "POST",
            "/users",
            json_body={
                "email": email.lower(),
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "first_name": first_name.strip(),
                    "last_name": last_name.strip(),
                },
            },
        )
        if resp.status_code >= 400:
            payload = resp.json()
            err = (payload.get("msg") or payload.get("error_description") or "").lower()
            if "already registered" in err or "user_already_exists" in err:
                raise EmailAlreadyExistsError(CODE_EMAIL_EXISTS)
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"{CODE_SEND_FAILED}: account creation failed",
            )
        return resp.json().get("id", "")

    def find_user_id(self, email: str) -> str | None:
        """Return the Supabase ``auth.users.id`` for ``email``, or None."""
        target = email.strip().lower()
        for page in range(1, 6):
            resp = self._admin_request("GET", f"/users?per_page=200&page={page}")
            resp.raise_for_status()
            for user in resp.json().get("users", []):
                if user.get("email", "").lower() == target:
                    return user.get("id")
            if len(resp.json().get("users", [])) < 200:
                return None
        return None

    def update_user_password(self, user_id: str, new_password: str) -> None:
        resp = self._admin_request("PUT", f"/users/{user_id}", json_body={"password": new_password})
        if resp.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"{CODE_SEND_FAILED}: password update failed",
            )

    # ── Verification-code persistence (service-role bypasses RLS) ──────

    @staticmethod
    def _store_code(email: str, purpose: str, code: str) -> None:
        service_client.table("verification_codes").upsert(
            {
                "email": email.lower(),
                "purpose": purpose,
                "code_hash": _hash_code(code),
                "attempts": 0,
                "expires_at": (
                    _now_utc().replace(microsecond=0)
                    + timedelta(minutes=settings.AUTH_CODE_TTL_MINUTES)
                ).isoformat(),
            },
            on_conflict="email,purpose",
        ).execute()

    @staticmethod
    def _fetch_code(email: str, purpose: str) -> dict | None:
        resp = (
            service_client.table("verification_codes")
            .select("*")
            .eq("email", email.lower())
            .eq("purpose", purpose)
            .limit(1)
            .execute()
        )
        return resp.data[0] if resp.data else None

    @staticmethod
    def _consume_code(row_id: str) -> None:
        service_client.table("verification_codes").delete().eq("id", row_id).execute()

    @staticmethod
    def _bump_attempts(row_id: str) -> None:
        service_client.table("verification_codes").update({"attempts": 1}).eq("id", row_id).execute()

    # ── Shared guards ─────────────────────────────────────────────────

    @staticmethod
    def _guard_code(row: dict | None, code: str) -> None:
        """Raise unless the stored code matches ``code`` and is still fresh."""
        if row is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=CODE_INVALID
            )
        if _parse_dt(row["expires_at"]) < _now_utc():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=CODE_INVALID
            )
        if row.get("attempts", 0) >= settings.AUTH_CODE_MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=CODE_TOO_MANY
            )
        if row["code_hash"] != _hash_code(code):
            AuthService._bump_attempts(row["id"])
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=CODE_INVALID
            )

    @staticmethod
    def _guard_resend_cooldown(row: dict | None) -> None:
        if row is None:
            return
        age = (_now_utc() - _parse_dt(row["created_at"])).total_seconds()
        if age < settings.AUTH_CODE_RESEND_SECONDS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=CODE_RESEND_TOO_SOON,
            )

    @staticmethod
    def _response(email: str, delivered: bool, dev_code: str | None = None) -> AuthCodeResponse:
        return AuthCodeResponse(
            ok=True,
            masked_email=_mask_email(email),
            email_live=mailer.email_is_live(),
            expires_minutes=settings.AUTH_CODE_TTL_MINUTES,
            dev_code=dev_code,
        )

    # ── Public flow entry-points ──────────────────────────────────────

    async def request_signup_code(self, email: str) -> AuthCodeResponse:
        """Verify the email is free, e-mail an 8-digit code, persist it hashed."""
        email = email.strip().lower()
        if self.email_exists(email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=CODE_EMAIL_EXISTS)

        existing = self._fetch_code(email, "signup")
        self._guard_resend_cooldown(existing)

        code = _new_code()
        self._store_code(email, "signup", code)
        delivered = mailer.send_verification_code(email, "there", code, "signup", settings.AUTH_CODE_TTL_MINUTES)

        if not delivered and settings.APP_ENV == "development":
            return self._response(email, delivered, dev_code=code)
        return self._response(email, delivered)

    async def verify_signup_code(self, body: VerifySignupRequest) -> AuthVerificationResponse:
        """Validate the code, then create the confirmed Supabase account."""
        validate_password_strength(body.password)

        row = self._fetch_code(body.email, "signup")
        self._guard_code(row, body.code)

        try:
            user_id = self.create_user(
                body.email, body.password, body.first_name, body.last_name
            )
        except EmailAlreadyExistsError as exc:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from None

        self._consume_code(row["id"])  # type: ignore[index]
        return AuthVerificationResponse(ok=True, email=body.email.lower(), user_id=user_id or None)

    async def request_password_reset_code(self, email: str) -> AuthCodeResponse:
        """E-mail an 8-digit reset code — always 'succeeds' (anti-enumeration)."""
        email = email.strip().lower()
        existing = self._fetch_code(email, "reset")
        self._guard_resend_cooldown(existing)

        code = _new_code()
        self._store_code(email, "reset", code)
        delivered = mailer.send_verification_code(email, "there", code, "reset", settings.AUTH_CODE_TTL_MINUTES)

        if not delivered and settings.APP_ENV == "development":
            return self._response(email, delivered, dev_code=code)
        return self._response(email, delivered)

    async def verify_password_reset(self, body: VerifyResetRequest) -> AuthVerificationResponse:
        """Validate the code, then set the new password for the account."""
        validate_password_strength(body.new_password)

        row = self._fetch_code(body.email, "reset")
        self._guard_code(row, body.code)

        user_id = self.find_user_id(body.email)
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=CODE_ACCOUNT_NOT_FOUND
            )

        self.update_user_password(user_id, body.new_password)
        self._consume_code(row["id"])  # type: ignore[index]
        return AuthVerificationResponse(ok=True, email=body.email.lower(), user_id=user_id)


auth_service = AuthService()