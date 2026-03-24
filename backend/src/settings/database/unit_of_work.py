from sqlalchemy.ext.asyncio import AsyncSession

from common.database.unit_of_work import UnitOfWork
from models import TenantContext
from settings.repositories import SettingsRepository


class SettingsUnitOfWork(UnitOfWork):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session)
        self.settings = SettingsRepository(session, tenant_context)
