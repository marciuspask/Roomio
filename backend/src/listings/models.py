from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class ListingType(StrEnum):
    OFFERING = "offering"  # Landlord offering a room
    SEEKING = "seeking"    # Tenant looking for a room


class GenderPref(StrEnum):
    ANY = "any"
    MALE = "male"
    FEMALE = "female"


class ListingStatus(StrEnum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"


class Listing(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Unique listing identifier")
    tenant_id: str = Field(description="Owner's tenant identifier for data isolation")
    listing_type: ListingType = Field(description="Whether offering or seeking a room")
    title: str = Field(description="Short headline for the listing")
    description: str = Field(description="Full description of the listing")
    city: str = Field(description="City where the room is located")
    district: str | None = Field(description="District or neighbourhood within the city")
    price: float = Field(description="Monthly rent price in local currency")
    utilities_incl: bool = Field(description="Whether utilities are included in the price")
    available_from: date = Field(description="Date from which the room is available")
    allows_smoking: bool = Field(description="Whether smoking is permitted")
    allows_pets: bool = Field(description="Whether pets are permitted")
    gender_pref: GenderPref = Field(description="Preferred gender of the tenant")
    status: ListingStatus = Field(description="Current listing status")
    is_boosted: bool = Field(description="Whether the listing is boosted for higher visibility")
    photos: list[str] = Field(default=[], description="List of photo URLs for the listing")
    street_address: str | None = Field(
        default=None,
        description="Street address — only visible to the listing owner, null for other viewers",
    )
    poster_display_name: str | None = Field(default=None, description="Poster's display name")
    poster_image_url: str | None = Field(default=None, description="Poster's profile photo URL")
    poster_age: int | None = Field(default=None, description="Poster's age")
    created_at: datetime = Field(description="When the listing was created")
    updated_at: datetime = Field(description="When the listing was last updated")


class ListingCreate(BaseModel):
    listing_type: ListingType = Field(description="Whether offering or seeking a room")
    title: str = Field(description="Short headline for the listing")
    description: str = Field(description="Full description of the listing")
    city: str = Field(description="City where the room is located")
    district: str | None = Field(default=None, description="District or neighbourhood")
    price: float = Field(description="Monthly rent price in local currency")
    utilities_incl: bool = Field(default=False, description="Whether utilities are included")
    available_from: date = Field(description="Date from which the room is available")
    allows_smoking: bool = Field(default=False, description="Whether smoking is permitted")
    allows_pets: bool = Field(default=False, description="Whether pets are permitted")
    gender_pref: GenderPref = Field(
        default=GenderPref.ANY, description="Preferred gender of the tenant",
    )
    status: ListingStatus = Field(
        default=ListingStatus.DRAFT, description="Initial listing status",
    )
    street_address: str | None = Field(
        default=None, description="Street address of the room (optional, kept private)",
    )
    photos: list[str] = Field(default=[], description="List of photo URLs for the listing")


class ListingUpdate(BaseModel):
    listing_type: ListingType | None = Field(
        default=None, description="Whether offering or seeking a room",
    )
    title: str | None = Field(default=None, description="Short headline for the listing")
    description: str | None = Field(default=None, description="Full description of the listing")
    city: str | None = Field(default=None, description="City where the room is located")
    district: str | None = Field(default=None, description="District or neighbourhood")
    price: float | None = Field(default=None, description="Monthly rent price in local currency")
    utilities_incl: bool | None = Field(default=None, description="Whether utilities are included")
    available_from: date | None = Field(
        default=None, description="Date from which the room is available",
    )
    allows_smoking: bool | None = Field(default=None, description="Whether smoking is permitted")
    allows_pets: bool | None = Field(default=None, description="Whether pets are permitted")
    gender_pref: GenderPref | None = Field(
        default=None, description="Preferred gender of the tenant",
    )
    status: ListingStatus | None = Field(default=None, description="Current listing status")
    street_address: str | None = Field(
        default=None, description="Street address of the room (optional, kept private)",
    )
    photos: list[str] | None = Field(default=None, description="List of photo URLs for the listing")


class ListingResponse(BaseModel):
    data: Listing = Field(description="Listing entity")


class ListingsResponse(BaseModel):
    data: list[Listing] = Field(description="List of listing entities")
    total: int = Field(description="Total number of active listings")
    limit: int = Field(description="Maximum number of listings returned")
    offset: int = Field(description="Number of listings skipped")
