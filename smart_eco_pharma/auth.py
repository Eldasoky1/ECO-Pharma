"""JWT authentication dependency for Supabase Auth.

Validates Supabase user access tokens from the Authorization header and
injects the authenticated user into the request context.

New Supabase projects sign user access tokens with ES256 (asymmetric ECDSA),
so tokens are verified against the project's JSON Web Key Set (JWKS) exposed at
``/auth/v1/.well-known/jwks.json`` rather than a shared HS256 secret. This
handles signing-key rotation automatically.
"""

from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

from .config import settings

_security = HTTPBearer(auto_error=False)

# Supabase signs user access tokens with ES256 for new projects (and RS256/HS256
# for legacy projects). Whitelisting ES256 + RS256 keeps us forward-compatible
# across projects while never accepting the insecure "none" algorithm.
ACCEPTED_ALGS = ["ES256", "RS256"]

_JWKS_URL = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"


@lru_cache(maxsize=1)
def _jwks_client() -> PyJWKClient:
    """Return a cached JWKS client keyed off the project's public keys."""
    return PyJWKClient(_JWKS_URL, cache_keys=True)


@dataclass(frozen=True)
class AuthUser:
    """Authenticated user extracted from the Supabase JWT."""

    user_id: str
    email: str | None = None
    role: str | None = None


def _decode_supabase_jwt(token: str) -> dict:
    """Decode and validate a Supabase user access token against the project JWKS."""
    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=ACCEPTED_ALGS,
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_security)] = None,
) -> AuthUser:
    """FastAPI dependency that extracts and validates the Supabase access token.

    Returns an AuthUser with the user_id from the token payload.
    Raises 401 if the token is missing or invalid.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    payload = _decode_supabase_jwt(credentials.credentials)

    user_id: str | None = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject claim")

    return AuthUser(
        user_id=user_id,
        email=payload.get("email"),
        role=payload.get("role"),
    )
