from sqlalchemy.ext.asyncio import AsyncSession

from common.database.unit_of_work import UnitOfWork
from models import TenantContext
from phone_verification.repositories import PhoneVerificationRepository
from profile.repositories import ProfileRepository


class PhoneVerificationUnitOfWork(UnitOfWork):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session)
        self.verifications = PhoneVerificationRepository(session, tenant_context)
        self.profiles = ProfileRepository(session, tenant_context)
