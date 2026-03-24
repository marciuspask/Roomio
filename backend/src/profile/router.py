from profile.models import Profile, ProfileResponse, ProfileUpdate

import structlog
from fastapi import APIRouter

from errors.base import BaseAppError, ErrorData

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

# In-memory store keyed by user id
_profiles: dict[str, Profile] = {
    "user_1": Profile(
        id="user_1",
        display_name="Demo User",
        bio="",
        email="demo@roomio.lt",
    )
}

# Hardcoded current user for now (will come from auth later)
_CURRENT_USER_ID = "user_1"


class ProfileError(BaseAppError):
    @classmethod
    def not_found(cls, user_id: str) -> "ProfileError":
        return cls(ErrorData(
            detail=f"Profile not found for user: {user_id}",
            error_code="PROFILE_NOT_FOUND",
            status_code=404,
            context={"user_id": user_id},
        ))


@router.get("/", response_model=ProfileResponse)
async def get_profile() -> ProfileResponse:
    profile = _profiles.get(_CURRENT_USER_ID)
    if not profile:
        logger.warning("profile_not_found_returning_default", user_id=_CURRENT_USER_ID)
        profile = Profile(
            id=_CURRENT_USER_ID,
            display_name="New User",
            bio="",
            email="",
        )
    else:
        logger.info("profile_fetched", user_id=_CURRENT_USER_ID)
    return ProfileResponse(data=profile)


@router.put("/", response_model=ProfileResponse)
async def update_profile(body: ProfileUpdate) -> ProfileResponse:
    existing = _profiles.get(_CURRENT_USER_ID)
    _profiles[_CURRENT_USER_ID] = Profile(
        id=_CURRENT_USER_ID,
        email=existing.email if existing else "",
        display_name=body.display_name,
        bio=body.bio,
    )
    logger.info("profile_updated", user_id=_CURRENT_USER_ID, display_name=body.display_name)
    return ProfileResponse(data=_profiles[_CURRENT_USER_ID])
