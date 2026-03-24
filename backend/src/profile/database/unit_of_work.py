from sqlalchemy.ext.asyncio import AsyncSession

from common.database.unit_of_work import UnitOfWork
from models import TenantContext
from profile.repositories import ProfileRepository


class ProfileUnitOfWork(UnitOfWork):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session)
        self.profile = ProfileRepository(session, tenant_context)
