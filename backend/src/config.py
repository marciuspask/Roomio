from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = Field(default="Roomio API", description="Name of the application")
    app_version: str = Field(default="0.1.0", description="Current version of the application")
    debug: bool = Field(default=False, description="Enable debug mode with verbose logging")
    host: str = Field(default="0.0.0.0", description="Host address the server binds to")
    port: int = Field(default=8000, description="Port the server listens on")
    clerk_secret_key: str = Field(description="Clerk secret key for JWT verification")
    database_url: str = Field(description="PostgreSQL async connection string (postgresql+asyncpg://...)")
