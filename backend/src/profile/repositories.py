from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.repository import TenantRepository
from models import TenantContext
from profile.database.orm_models import ProfileORM
from profile.models import Profile, ProfileSystemUpdate, ProfileUpdate


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
        system_data: ProfileSystemUpdate | None = None,
    ) -> Profile:
        """Create a profile. tenant_id is auto-injected by TenantRepository.
        system_data carries Clerk-synced fields (email, image_url, etc.) that
        the user cannot supply directly.
        """
        extra: dict[str, object] = {}
        if system_data is not None:
            extra.update(system_data.model_dump(exclude_none=True))
        return await self._create(data, extra_fields=extra or None)

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

    async def get_by_tenant_ids_bulk(self, tenant_ids: list[str]) -> list[Profile]:
        """Get profiles for multiple tenant IDs in one query."""
        if not tenant_ids:
            return []
        stmt = select(ProfileORM).where(ProfileORM.tenant_id.in_(tenant_ids))
        result = await self.session.execute(stmt)
        return self.to_model_list(list(result.scalars().all()))

    async def update_profile(
        self,
        profile_id: str,
        data: ProfileUpdate,
        system_data: ProfileSystemUpdate | None = None,
    ) -> Profile | None:
        """Update a profile by ID. Returns None if not found or not owned by tenant."""
        entity = await self.session.get(ProfileORM, profile_id)
        if entity is None or entity.tenant_id != self._tenant_id:
            return None
        self._converter.apply_update(entity, data)
        if system_data is not None:
            self._converter.apply_update(entity, system_data)
        await self.session.flush()
        await self.session.refresh(entity)
        return self.to_model(entity)
