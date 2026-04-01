from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SavedListing(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Unique saved-listing identifier (UUID)")
    tenant_id: str = Field(description="Tenant who saved the listing")
    listing_id: str = Field(description="ID of the saved listing")
    created_at: datetime = Field(description="When the listing was saved")


class SavedListingCreate(BaseModel):
    listing_id: str = Field(description="ID of the listing to save")


class SavedListingsResponse(BaseModel):
    data: list[str] = Field(description="List of saved listing IDs")
