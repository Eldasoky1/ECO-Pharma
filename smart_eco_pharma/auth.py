"""JWT authentication dependency for Supabase Auth.

Validates Supabase JWT tokens from the Authorization header and injects
the authenticated user into the request context.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings

_security = HTTPBearer(auto_error=False)

JWT_SECRET = settings.SUPABASE_SERVICE_ROLE_KEY
ALGORITHM = "HS256"


@dataclass(frozen=True)
class AuthUser:
    """Authenticated user extracted from the Supabase JWT."""

    user_id: str
    email: str | None = None
    role: str | None = None


def _decode_supabase_jwt(token: str) -> dict:
    """Decode and validate a Supabase JWT token."""
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[ALGORITHM],
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
    """FastAPI dependency that extracts and validates the Supabase JWT.

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
