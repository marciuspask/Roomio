from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.repository import TenantRepository
from models import TenantContext
from settings.database.orm_models import SettingsORM
from settings.models import Settings, SettingsUpdate


class SettingsRepository(TenantRepository[SettingsORM, Settings]):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session, SettingsORM, Settings, tenant_context)

    async def create_settings(self, data: SettingsUpdate) -> Settings:
        """Create settings, letting ORM column defaults fill in any unset fields."""
        # exclude_none so that ORM column defaults (default=) kick in for unset fields
        fields = {k: v for k, v in data.model_dump().items() if v is not None}
        fields["tenant_id"] = self._tenant_id
        fields["tenant_type"] = self._tenant_type
        entity = SettingsORM(**fields)
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return self.to_model(entity)

    async def update_settings(self, settings_id: str, data: SettingsUpdate) -> Settings | None:
        return await self._update(settings_id, data)

    async def get_for_tenant(self) -> Settings | None:
        stmt = (
            select(SettingsORM)
            .where(SettingsORM.tenant_id == self._tenant_id)
            .limit(1)
        )
        result = await self.session.execute(stmt)
        entity = result.scalars().first()
        if entity is None:
            return None
        return self.to_model(entity)
