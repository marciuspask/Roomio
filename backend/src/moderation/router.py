from fastapi import APIRouter, status

from di import ModerationServiceDep
from moderation.models import ReportCreate

router = APIRouter(prefix="/api/v1/moderation", tags=["moderation"])


@router.post("/block/{user_id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
async def block_user(user_id: str, service: ModerationServiceDep) -> None:
    await service.block_user(user_id)


@router.delete("/block/{user_id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
async def unblock_user(user_id: str, service: ModerationServiceDep) -> None:
    await service.unblock_user(user_id)


@router.post("/report", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
async def report(body: ReportCreate, service: ModerationServiceDep) -> None:
    await service.report(body)
