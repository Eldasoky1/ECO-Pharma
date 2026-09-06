"""Application configuration — loaded from environment / .env file."""

from __future__ import annotations

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central settings object populated from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # Supabase
    SUPABASE_URL: str = Field(..., description="Supabase project URL")
    SUPABASE_ANON_KEY: str = Field(..., description="Supabase anonymous / public key")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(..., description="Supabase service-role key (secret)")

    # OpenRouter
    OPENROUTER_API_KEY: str = Field(..., description="OpenRouter API key")
    OPENROUTER_BASE_URL: str = Field(
        default="https://openrouter.ai/api/v1",
        description="OpenRouter base URL",
    )

    # Application
    APP_ENV: str = Field(default="development", description="Runtime environment: development or production")
    APP_VERSION: str = Field(default="0.1.0", description="Application semantic version")
    CORS_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="Comma-separated allowed CORS origins",
    )
    GPT_MODEL: str = Field(default="openai/gpt-4o", description="Model identifier for OpenRouter")

    # Email delivery for the 8-digit verification code (Resend API key takes
    # priority; otherwise generic SMTP is used).  When neither is configured the
    # code is returned on the API response in development and logged to the
    # console in production so the flow is always testable.
    RESEND_API_KEY: str = Field(default="", description="Resend API key used to send verification emails")
    SMTP_HOST: str = Field(default="", description="SMTP server host used to send verification emails")
    SMTP_PORT: int = Field(default=587, description="SMTP server port")
    SMTP_USER: str = Field(default="", description="SMTP login username")
    SMTP_PASS: str = Field(default="", description="SMTP login password")
    SMTP_FROM: str = Field(
        default="Smart Eco-Pharma Hub <no-reply@smart-eco-pharma.com>",
        description="Sender shown on verification emails",
    )

    # Verification codes (8-digit email verification)
    AUTH_CODE_LENGTH: int = Field(default=8, description="Number of digits in the email verification code")
    AUTH_CODE_TTL_MINUTES: int = Field(default=10, description="Minutes a verification code stays valid")
    AUTH_CODE_MAX_ATTEMPTS: int = Field(default=5, description="Max failed attempts before a code is invalidated")
    AUTH_CODE_RESEND_SECONDS: int = Field(default=60, description="Cooldown between code resend requests")

    # -- Derived helpers --------------------------------------------------

    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse the comma-separated CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
