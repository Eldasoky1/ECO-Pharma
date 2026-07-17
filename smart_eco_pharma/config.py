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

    # -- Derived helpers --------------------------------------------------

    @computed_field  # type: ignore[prop-decorator]
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse the comma-separated CORS_ORIGINS string into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
