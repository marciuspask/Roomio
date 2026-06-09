from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.repository import TenantRepository
from models import TenantContext
from moderation.database.orm_models import BlockORM, ReportORM
from moderation.models import ReportCreate


class _BlockCreate(BaseModel):
    blocked_id: str


class _BlockModel(BaseModel):
    id: str
    tenant_id: str
    tenant_type: str
    blocked_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class _ReportModel(BaseModel):
    id: str
    tenant_id: str
    tenant_type: str
    target_type: str
    target_id: str
    reason: str
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BlockRepository(TenantRepository[BlockORM, _BlockModel]):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session, BlockORM, _BlockModel, tenant_context)

    async def block_user(self, blocked_id: str) -> None:
        existing = await self._get_block(blocked_id)
        if existing is None:
            await self._create(_BlockCreate(blocked_id=blocked_id))

    async def unblock_user(self, blocked_id: str) -> None:
        stmt = delete(BlockORM).where(
            BlockORM.tenant_id == self._tenant_id,
            BlockORM.blocked_id == blocked_id,
        )
        await self.session.execute(stmt)
        await self.session.flush()

    async def get_blocked_ids(self) -> list[str]:
        stmt = select(BlockORM.blocked_id).where(BlockORM.tenant_id == self._tenant_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def is_blocked(self, blocked_id: str) -> bool:
        return await self._get_block(blocked_id) is not None

    async def _get_block(self, blocked_id: str) -> _BlockModel | None:
        stmt = (
            select(BlockORM)
            .where(BlockORM.tenant_id == self._tenant_id)
            .where(BlockORM.blocked_id == blocked_id)
            .limit(1)
        )
        result = await self.session.execute(stmt)
        entity = result.scalars().first()
        if entity is None:
            return None
        return self.to_model(entity)


class ReportRepository(TenantRepository[ReportORM, _ReportModel]):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session, ReportORM, _ReportModel, tenant_context)

    async def create_report(self, data: ReportCreate) -> _ReportModel:
        return await self._create(data)
