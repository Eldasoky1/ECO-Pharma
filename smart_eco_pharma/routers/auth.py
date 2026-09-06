"""FastAPI router for the 8-digit email-verification authentication flows.

All four endpoints are intentionally *public* — they are the account-creation
and password-recovery entry points.  Session verification after sign-in is
handled by ``auth.get_current_user`` on the protected routers.
"""

from __future__ import annotations

from fastapi import APIRouter

from ..models.authentication import (
    AuthCodeResponse,
    AuthVerificationResponse,
    RequestCodeRequest,
    VerifyResetRequest,
    VerifySignupRequest,
)
from ..services.auth_service import auth_service

router = APIRouter(tags=["auth"])


@router.post("/code/signup", response_model=AuthCodeResponse)
async def request_signup_code(body: RequestCodeRequest) -> AuthCodeResponse:
    """Request an 8-digit verification code for a new account.

    Returns 409 ``EMAIL_EXISTS`` when the email already belongs to an account,
    so the client can offer "log in" or "reset password" instead.
    """
    return await auth_service.request_signup_code(body.email)


@router.post("/verify/signup", response_model=AuthVerificationResponse)
async def verify_signup(body: VerifySignupRequest) -> AuthVerificationResponse:
    """Verify the code and create the account (then the client signs in)."""
    return await auth_service.verify_signup_code(body)


@router.post("/code/reset", response_model=AuthCodeResponse)
async def request_password_reset_code(body: RequestCodeRequest) -> AuthCodeResponse:
    """Request an 8-digit code to reset a forgotten password."""
    return await auth_service.request_password_reset_code(body.email)


@router.post("/verify/reset", response_model=AuthVerificationResponse)
async def verify_password_reset(body: VerifyResetRequest) -> AuthVerificationResponse:
    """Verify the code and set the new password."""
    return await auth_service.verify_password_reset(body)