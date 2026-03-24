from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    display_name: str = Field(
        min_length=1,
        max_length=100,
        description="Publicly visible name shown on listings and messages",
    )
    bio: str = Field(
        default="",
        max_length=500,
        description="Short description the user writes about themselves",
    )


class Profile(BaseModel):
    id: str = Field(description="Unique identifier for the user")
    display_name: str = Field(description="Publicly visible name shown on listings and messages")
    bio: str = Field(description="Short description the user writes about themselves")
    email: str = Field(description="User's email address")


class ProfileResponse(BaseModel):
    data: Profile = Field(description="The user's profile data")
