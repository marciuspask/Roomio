from sqlalchemy.ext.asyncio import AsyncSession

from common.database.unit_of_work import UnitOfWork
from listings.repositories import ListingsRepository
from models import TenantContext


class ListingsUnitOfWork(UnitOfWork):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session)
        self.listings = ListingsRepository(session, tenant_context)
