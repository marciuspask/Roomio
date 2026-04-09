from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class Occupation(StrEnum):
    STUDENT = "student"
    WORKING = "working"
    OTHER = "other"


class Profile(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Unique profile identifier (UUID)")
    tenant_id: str = Field(description="Owner's tenant identifier for data isolation")
    display_name: str = Field(description="Publicly visible name shown on listings and messages")
    bio: str = Field(default="", description="Short description the user writes about themselves")
    occupation: Occupation | None = Field(default=None, description="User's employment status")
    email: str | None = Field(default=None, description="User's email address")
    is_email_verified: bool = Field(default=False, description="Email has been verified")
    is_phone_verified: bool = Field(default=False, description="Phone number has been verified")
    image_url: str | None = Field(default=None, description="Profile photo URL from Clerk")
    date_of_birth: date | None = Field(default=None, description="User's date of birth (private)")
    age: int | None = Field(default=None, description="User's age, computed from date of birth")
    created_at: datetime = Field(description="Timestamp when the profile was created")
    updated_at: datetime = Field(description="Timestamp when the profile was last updated")


class ProfileUpdate(BaseModel):
    display_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Publicly visible name shown on listings and messages",
    )
    bio: str | None = Field(
        default=None,
        max_length=500,
        description="Short description the user writes about themselves",
    )
    occupation: Occupation | None = Field(default=None, description="User's employment status")
    date_of_birth: date | None = Field(default=None, description="User's date of birth")


class ProfileSystemUpdate(BaseModel):
    """For internal/system-driven updates — fields the user cannot set directly."""
    email: str | None = Field(default=None, description="User's email address synced from Clerk")
    is_email_verified: bool | None = Field(
        default=None, description="Whether the user's email has been verified (from Clerk)"
    )
    is_phone_verified: bool | None = Field(
        default=None, description="Whether the user's phone number has been verified (from Clerk)"
    )
    image_url: str | None = Field(default=None, description="Profile photo URL synced from Clerk")
    age: int | None = Field(default=None, description="User's age, computed from date_of_birth")


class ProfileResponse(BaseModel):
    data: Profile = Field(description="The user's profile data")
