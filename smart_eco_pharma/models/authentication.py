"""Pydantic models for the 8-digit email-verification authentication flows."""

from __future__ import annotations

from pydantic import BaseModel, Field

_EMAIL_PATTERN = r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$"


class RequestCodeRequest(BaseModel):
    """Body for requesting an 8-digit verification code to an email address."""

    email: str = Field(pattern=_EMAIL_PATTERN)


class VerifySignupRequest(BaseModel):
    """Body for verifying a signup code and creating the account."""

    email: str = Field(pattern=_EMAIL_PATTERN)
    code: str = Field(min_length=8, max_length=8)
    first_name: str = Field(default="", min_length=1, max_length=80)
    last_name: str = Field(default="", max_length=80)
    password: str = Field(min_length=1, max_length=200)


class VerifyResetRequest(BaseModel):
    """Body for verifying a password-reset code and setting a new password."""

    email: str = Field(pattern=_EMAIL_PATTERN)
    code: str = Field(min_length=8, max_length=8)
    new_password: str = Field(min_length=1, max_length=200)


class AuthCodeResponse(BaseModel):
    """Response to a code request — never includes the code in production."""

    ok: bool
    masked_email: str
    email_live: bool
    expires_minutes: int
    # Development-only fallback: echoed only when APP_ENV == "development" and
    # no email provider is configured, so the flow can be tested end-to-end.
    dev_code: str | None = None


class AuthVerificationResponse(BaseModel):
    """Response after a code is successfully verified."""

    ok: bool
    email: str
    user_id: str | None = None