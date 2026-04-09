from sqlalchemy.ext.asyncio import AsyncSession

from common.database.unit_of_work import UnitOfWork
from listings.repositories import ListingsRepository
from models import TenantContext
from profile.repositories import ProfileRepository


class ListingsUnitOfWork(UnitOfWork):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session)
        self.listings = ListingsRepository(session, tenant_context)
        # Read-only access to profiles for enrichment (same session)
        self.profiles = ProfileRepository(session, tenant_context)
