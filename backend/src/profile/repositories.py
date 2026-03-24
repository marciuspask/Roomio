from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.repository import TenantRepository
from models import TenantContext
from profile.database.orm_models import ProfileORM
from profile.models import Profile, ProfileUpdate


class ProfileRepository(TenantRepository[ProfileORM, Profile]):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session, ProfileORM, Profile, tenant_context)

    async def get_for_tenant(self) -> Profile | None:
        """Get the profile for the current tenant. Returns None if not yet created."""
        stmt = (
            select(ProfileORM)
            .where(ProfileORM.tenant_id == self._tenant_id)
            .limit(1)
        )
        result = await self.session.execute(stmt)
        entity = result.scalars().first()
        if entity is None:
            return None
        return self.to_model(entity)

    async def create_profile(
        self,
        data: ProfileUpdate,
        email: str | None = None,
    ) -> Profile:
        """Create a profile. tenant_id is auto-injected by TenantRepository.
        email is passed separately because it comes from Clerk, not the form.
        """
        extra: dict[str, object] = {}
        if email is not None:
            extra["email"] = email
        return await self._create(data, extra_fields=extra)

    async def get_by_tenant_id(self, tenant_id: str) -> Profile | None:
        """Get any profile by tenant_id — no ownership check, for public access."""
        stmt = (
            select(ProfileORM)
            .where(ProfileORM.tenant_id == tenant_id)
            .limit(1)
        )
        result = await self.session.execute(stmt)
        entity = result.scalars().first()
        if entity is None:
            return None
        return self.to_model(entity)

    async def update_profile(
        self,
        profile_id: str,
        data: ProfileUpdate,
    ) -> Profile | None:
        """Update a profile by ID. Returns None if not found or not owned by tenant."""
        return await self._update(profile_id, data)
