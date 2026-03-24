import structlog
from fastapi import APIRouter

from di import SettingsServiceDep
from settings.models import SettingsResponse, SettingsUpdate

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


@router.get("/", response_model=SettingsResponse)
async def get_settings(service: SettingsServiceDep) -> SettingsResponse:
    result = await service.get_or_create_settings()
    return SettingsResponse(data=result)


@router.put("/", response_model=SettingsResponse)
async def update_settings(
    body: SettingsUpdate,
    service: SettingsServiceDep,
) -> SettingsResponse:
    result = await service.update_settings(body)
    return SettingsResponse(data=result)
