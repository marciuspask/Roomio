from sqlalchemy.ext.asyncio import AsyncSession

from common.database.unit_of_work import UnitOfWork
from models import TenantContext
from moderation.repositories import BlockRepository, ReportRepository


class ModerationUnitOfWork(UnitOfWork):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session)
        self.blocks = BlockRepository(session, tenant_context)
        self.reports = ReportRepository(session, tenant_context)
