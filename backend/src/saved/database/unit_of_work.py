from sqlalchemy.ext.asyncio import AsyncSession

from common.database.unit_of_work import UnitOfWork
from models import TenantContext
from saved.repositories import SavedListingsRepository


class SavedListingsUnitOfWork(UnitOfWork):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session)
        self.saved = SavedListingsRepository(session, tenant_context)
