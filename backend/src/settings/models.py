from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class Theme(StrEnum):
    LIGHT = "light"
    DARK = "dark"
    SYSTEM = "system"


class EmailDigest(StrEnum):
    DAILY = "daily"
    WEEKLY = "weekly"
    NEVER = "never"


class Settings(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Unique settings identifier")
    theme: Theme = Field(description="UI theme preference")
    language: str = Field(description="Preferred language code")
    notifications_enabled: bool = Field(description="Whether push notifications are enabled")
    email_digest: EmailDigest = Field(description="Email digest frequency")
    timezone: str = Field(description="User timezone")
    tenant_id: str = Field(description="Tenant identifier for data isolation")
    created_at: datetime = Field(description="When settings were created")
    updated_at: datetime = Field(description="When settings were last updated")


class SettingsUpdate(BaseModel):
    theme: Theme | None = Field(default=None, description="UI theme preference")
    language: str | None = Field(default=None, description="Preferred language code")
    notifications_enabled: bool | None = Field(
        default=None, description="Whether push notifications are enabled",
    )
    email_digest: EmailDigest | None = Field(default=None, description="Email digest frequency")
    timezone: str | None = Field(default=None, description="User timezone")


class SettingsResponse(BaseModel):
    data: Settings = Field(description="Settings entity")
