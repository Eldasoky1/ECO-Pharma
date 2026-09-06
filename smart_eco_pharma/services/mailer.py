"""Transactional email delivery for the 8-digit verification codes.

Delivery strategy, in priority order:
1. Resend (``RESEND_API_KEY``) — simplest, no server to run.
2. Generic SMTP (``SMTP_HOST`` + ``SMTP_USER``/``SMTP_PASS``).
3. Console fallback — the code is logged to the server console and (in
   development only) returned on the API response via ``dev_code``.

Only ever sends — never reads.  Code storage/validation lives in
``services/auth_service.py``.
"""

from __future__ import annotations

import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx

from ..config import settings

logger = logging.getLogger(__name__)

_RESEND_URL = "https://api.resend.com/emails"


def email_is_live() -> bool:
    """True when at least one outbound email provider is configured."""
    return bool(settings.RESEND_API_KEY or settings.SMTP_HOST)


def _purpose_label(purpose: str) -> tuple[str, str]:
    """Return (subject, headline) for a code purpose."""
    if purpose == "reset":
        return "Reset your password", "Reset your password"
    return "Verify your email", "Verify your email"


def _html_body(name: str, code: str, purpose: str, expires_minutes: int) -> str:
    _, headline = _purpose_label(purpose)
    intro = (
        "Enter the 8-digit code below to create your account and join your "
        "pharmacy network."
        if purpose != "reset"
        else "Enter the 8-digit code below to choose a new password for your "
        "Smart Eco-Pharma Hub account."
    )
    escaped = code.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    grouped = f"{escaped[:4]}&nbsp;{escaped[4:]}"
    return f"""\
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#03140d;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#03140d;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #0b3d2a;">
            <tr>
              <td style="background:linear-gradient(135deg,#065f46 0%,#059669 55%,#0d9488 100%);padding:32px 32px 30px;">
                <div style="color:#ffffff;font-size:19px;font-weight:bold;letter-spacing:.3px;">Smart Eco-Pharma&nbsp;Hub</div>
                <div style="color:#99f6e4;font-size:12px;margin-top:5px;letter-spacing:.2px;">{headline}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="font-size:17px;font-weight:bold;color:#064e3b;">Hi {name},</div>
                <p style="font-size:14px;line-height:1.6;color:#475569;margin:10px 0 22px;">{intro}</p>
                <div style="background:#052e25;border-radius:16px;padding:22px 20px;text-align:center;border:1px solid rgba(16,185,129,.25);">
                  <div style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#34d399;font-weight:bold;">Your 8-digit verification code</div>
                  <div style="font-family:'Courier New',Courier,monospace;font-size:40px;font-weight:bold;letter-spacing:8px;color:#ffffff;margin:14px 0 6px;">{grouped}</div>
                  <div style="font-size:12px;color:#6ee7b7;">Expires in {expires_minutes} minutes</div>
                </div>
                <p style="font-size:12px;line-height:1.6;color:#94a3b8;margin:22px 0 0;">
                  If you didn't request this code you can safely ignore this email. Never share it with anyone — our team will never ask for it.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#04301f;border-top:1px solid #0b3d2a;">
                <div style="font-size:12px;color:#6ee7b7;font-weight:bold;letter-spacing:.2px;">www.smart-eco-pharma.com</div>
                <div style="font-size:11px;color:#8fb3a4;margin-top:5px;">The sustainable operations hub for modern pharmacy networks</div>
                <div style="font-size:10px;color:#5e7f72;margin-top:8px;">HIPAA · 21 CFR Part 11 Compliant · Cold-chain verified</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""


def _resend_send(to_email: str, subject: str, html: str) -> None:
    """Deliver via the Resend HTTP API."""
    resp = httpx.post(
        _RESEND_URL,
        headers={
            "Authorization": f"Bearer {settings.RESEND_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "from": settings.SMTP_FROM,
            "to": [to_email],
            "subject": subject,
            "html": html,
        },
        timeout=15.0,
    )
    if resp.status_code >= 300:
        raise RuntimeError(f"Resend refused email ({resp.status_code}): {resp.text[:200]}")


def _smtp_send(to_email: str, subject: str, html: str) -> None:
    """Deliver via generic SMTP with STARTTLS."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html", "utf-8"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as smtp:
        smtp.ehlo()
        if smtp.has_extn("starttls"):
            smtp.starttls()
            smtp.ehlo()
        if settings.SMTP_USER:
            smtp.login(settings.SMTP_USER, settings.SMTP_PASS)
        smtp.sendmail(settings.SMTP_FROM, [to_email], msg.as_string())


def send_verification_code(
    to_email: str,
    name: str,
    code: str,
    purpose: str,  # "signup" | "reset"
    expires_minutes: int,
) -> bool:
    """Send the 8-digit code email.

    Returns True when the email was handed to a real provider, False when it was
    only logged (providers unconfigured) so callers can enable the dev fallback.
    """
    subject, _ = _purpose_label(purpose)
    html = _html_body(name, code, purpose, expires_minutes)

    if settings.RESEND_API_KEY:
        try:
            _resend_send(to_email, subject, html)
            logger.info("Verification email sent via Resend to %s (%s)", to_email, purpose)
            return True
        except Exception:
            logger.exception("Resend delivery failed; falling back for %s", to_email)

    if settings.SMTP_HOST:
        try:
            _smtp_send(to_email, subject, html)
            logger.info("Verification email sent via SMTP to %s (%s)", to_email, purpose)
            return True
        except Exception:
            logger.exception("SMTP delivery failed for %s", to_email)

    # No provider configured (or all failed) — log the code so the flow still works.
    logger.warning("NO EMAIL PROVIDER — verification code for %s (%s): %s", to_email, purpose, code)
    return False