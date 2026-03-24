import structlog
from fastapi import APIRouter

from di import ProfileServiceDep, PublicProfileServiceDep
from profile.models import ProfileResponse, ProfileUpdate

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])
users_router = APIRouter(prefix="/api/v1/users", tags=["profile"])


@router.get("/", response_model=ProfileResponse)
async def get_profile(service: ProfileServiceDep) -> ProfileResponse:
    result = await service.get_or_create_profile()
    return ProfileResponse(data=result)


@router.put("/", response_model=ProfileResponse)
async def update_profile(
    body: ProfileUpdate,
    service: ProfileServiceDep,
) -> ProfileResponse:
    result = await service.update_profile(body)
    return ProfileResponse(data=result)


@users_router.get("/{user_id}/profile", response_model=ProfileResponse)
async def get_public_profile(
    user_id: str,
    service: PublicProfileServiceDep,
) -> ProfileResponse:
    result = await service.get_public_profile(user_id)
    return ProfileResponse(data=result)
