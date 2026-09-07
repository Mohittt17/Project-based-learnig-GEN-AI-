"""
Application configuration using pydantic-settings.
All values are read from environment variables / .env file.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    app_name: str = "AI Code Assistant"
    app_version: str = "1.0.0"
    debug: bool = False

    # Security
    secret_key: str = "change_this_secret"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Database
    database_url: str = "sqlite:///./ai_code_assistant.db"

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # AI Provider
    ai_provider: str = "gemini"
    ai_model: str = "gemini-1.5-flash"
    gemini_api_key: str = ""

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance — only reads .env once."""
    return Settings()
