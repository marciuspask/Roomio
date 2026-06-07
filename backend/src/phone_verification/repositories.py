import random
import string
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models import TenantContext
from phone_verification.database.orm_models import PhoneVerificationORM


class PhoneVerificationRepository:
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        self.session = session
        self._tenant_id = tenant_context.tenant_id

    def _generate_code(self) -> str:
        return "".join(random.choices(string.digits, k=6))

    async def create_code(self, phone_number: str) -> str:
        code = self._generate_code()
        record = PhoneVerificationORM(
            tenant_id=self._tenant_id,
            phone_number=phone_number,
            code=code,
            expires_at=datetime.now(UTC) + timedelta(minutes=10),
        )
        self.session.add(record)
        await self.session.flush()
        return code

    async def find_valid(self, phone_number: str, code: str) -> PhoneVerificationORM | None:
        stmt = (
            select(PhoneVerificationORM)
            .where(
                PhoneVerificationORM.tenant_id == self._tenant_id,
                PhoneVerificationORM.phone_number == phone_number,
                PhoneVerificationORM.code == code,
                PhoneVerificationORM.is_used == False,  # noqa: E712
                PhoneVerificationORM.expires_at > datetime.now(UTC),
            )
            .order_by(PhoneVerificationORM.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def mark_used(self, record: PhoneVerificationORM) -> None:
        record.is_used = True
        await self.session.flush()

    async def has_recent_request(self, phone_number: str) -> bool:
        """Rate limit: block if a code was created within the last 60 seconds."""
        cutoff = datetime.now(UTC) - timedelta(seconds=60)
        stmt = (
            select(PhoneVerificationORM)
            .where(
                PhoneVerificationORM.tenant_id == self._tenant_id,
                PhoneVerificationORM.phone_number == phone_number,
                PhoneVerificationORM.created_at > cutoff,
            )
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first() is not None
