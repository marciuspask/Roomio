import uuid
from datetime import UTC, datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.repository import TenantRepository
from messages.database.orm_models import ConversationParticipantORM
from messages.models import Participant
from models import TenantContext


class ParticipantRepository(TenantRepository[ConversationParticipantORM, Participant]):

    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session, ConversationParticipantORM, Participant, tenant_context)

    async def get_my_conversation_ids(self) -> list[str]:
        """Get all conversation IDs this tenant participates in."""
        stmt = select(ConversationParticipantORM.conversation_id).where(
            ConversationParticipantORM.tenant_id == self._tenant_context.tenant_id
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def is_participant(self, conversation_id: str) -> bool:
        """Check if current tenant is a participant in the conversation."""
        stmt = select(ConversationParticipantORM).where(
            ConversationParticipantORM.conversation_id == conversation_id,
            ConversationParticipantORM.tenant_id == self._tenant_context.tenant_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() is not None

    async def get_participant_ids(self, conversation_id: str) -> list[str]:
        """Get all tenant_ids in a conversation."""
        stmt = select(ConversationParticipantORM.tenant_id).where(
            ConversationParticipantORM.conversation_id == conversation_id
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_participant_ids_bulk(self, conversation_ids: list[str]) -> dict[str, list[str]]:
        """Get participant tenant_ids for multiple conversations in one query."""
        if not conversation_ids:
            return {}
        stmt = select(
            ConversationParticipantORM.conversation_id,
            ConversationParticipantORM.tenant_id,
        ).where(ConversationParticipantORM.conversation_id.in_(conversation_ids))
        result = await self.session.execute(stmt)
        mapping: dict[str, list[str]] = {}
        for row in result.all():
            mapping.setdefault(row.conversation_id, []).append(row.tenant_id)
        return mapping

    async def mark_as_read(self, conversation_id: str) -> None:
        """Update last_read_at for current tenant in this conversation."""
        stmt = (
            update(ConversationParticipantORM)
            .where(
                ConversationParticipantORM.conversation_id == conversation_id,
                ConversationParticipantORM.tenant_id == self._tenant_context.tenant_id,
            )
            .values(last_read_at=datetime.now(UTC))
        )
        await self.session.execute(stmt)

    async def add_participants(
        self, conversation_id: str, tenant_ids: list[str], roles: list[str]
    ) -> None:
        """Add participants to a conversation."""
        for tenant_id, role in zip(tenant_ids, roles, strict=False):
            participant = ConversationParticipantORM(
                id=str(uuid.uuid4()),
                conversation_id=conversation_id,
                tenant_id=tenant_id,
                tenant_type="user",
                role=role,
            )
            self.session.add(participant)
