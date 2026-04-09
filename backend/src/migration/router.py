from fastapi import APIRouter
from pydantic import BaseModel, Field

from di import MigrationServiceDep

router = APIRouter(tags=["migration"])


class MigrateAnonymousRequest(BaseModel):
    anonymous_id: str = Field(
        description="The anonymous UID from localStorage (e.g. anon-<uuid>)",
        min_length=1,
    )


@router.post("/api/v1/migrate-anonymous", status_code=204)
async def migrate_anonymous(
    body: MigrateAnonymousRequest,
    service: MigrationServiceDep,
) -> None:
    """One-time call after Clerk signup to claim pre-registration data."""
    await service.convert_anonymous_to_registered(body.anonymous_id)
