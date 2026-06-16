import uuid
from datetime import UTC, datetime

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from common.database.repository import BaseRepository
from messages.database.orm_models import ConversationORM, ConversationParticipantORM, MessageORM
from messages.models import Conversation, Message


class ConversationRepository(BaseRepository[ConversationORM, Conversation]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, ConversationORM, Conversation)

    async def get_by_id(self, entity_id: str) -> Conversation | None:
        entity = await self.session.get(ConversationORM, entity_id)
        if entity is None:
            return None
        return self.to_model(entity)

    async def get_by_ids(
        self, conversation_ids: list[str], *, limit: int = 20, offset: int = 0
    ) -> list[Conversation]:
        if not conversation_ids:
            return []
        stmt = (
            select(ConversationORM)
            .where(ConversationORM.id.in_(conversation_ids))
            .order_by(ConversationORM.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        return self.to_model_list(list(result.scalars().all()))

    async def get_between_participants(
        self,
        tenant_id_1: str,
        tenant_id_2: str,
        listing_id: str,
    ) -> Conversation | None:
        cp1 = aliased(ConversationParticipantORM)
        cp2 = aliased(ConversationParticipantORM)
        stmt = (
            select(ConversationORM)
            .join(cp1, cp1.conversation_id == ConversationORM.id)
            .join(cp2, cp2.conversation_id == ConversationORM.id)
            .where(ConversationORM.listing_id == listing_id)
            .where(cp1.tenant_id == tenant_id_1)
            .where(cp2.tenant_id == tenant_id_2)
            .limit(1)
        )
        result = await self.session.execute(stmt)
        entity = result.scalars().first()
        if entity is None:
            return None
        return self.to_model(entity)

    async def create_conversation(self, listing_id: str) -> Conversation:
        entity = ConversationORM(
            id=str(uuid.uuid4()),
            listing_id=listing_id,
        )
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return self.to_model(entity)

    async def touch(self, conversation_id: str) -> None:
        """Bump updated_at so the conversation surfaces at the top of the list."""
        entity = await self.session.get(ConversationORM, conversation_id)
        if entity is not None:
            entity.updated_at = datetime.now(UTC)
            await self.session.flush()


class MessageRepository(BaseRepository[MessageORM, Message]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, MessageORM, Message)

    async def get_for_conversation(
        self, conversation_id: str, *, limit: int = 50, offset: int = 0
    ) -> list[Message]:
        stmt = (
            select(MessageORM)
            .where(MessageORM.conversation_id == conversation_id)
            .order_by(MessageORM.created_at.asc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        return self.to_model_list(list(result.scalars().all()))

    async def count_messages(self, conversation_id: str) -> int:
        stmt = select(func.count()).where(MessageORM.conversation_id == conversation_id)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def get_last_messages_bulk(
        self,
        conversation_ids: list[str],
    ) -> dict[str, Message]:
        """Return the most recent message per conversation in one query."""
        if not conversation_ids:
            return {}

        ranked = (
            select(
                MessageORM,
                func.row_number()
                .over(
                    partition_by=MessageORM.conversation_id,
                    order_by=MessageORM.created_at.desc(),
                )
                .label("rn"),
            )
            .where(MessageORM.conversation_id.in_(conversation_ids))
            .subquery()
        )
        stmt = (
            select(MessageORM)
            .join(
                ranked,
                MessageORM.id == ranked.c.id,
            )
            .where(ranked.c.rn == 1)
        )

        result = await self.session.execute(stmt)
        return {entity.conversation_id: self.to_model(entity) for entity in result.scalars().all()}

    async def get_last_message(self, conversation_id: str) -> Message | None:
        stmt = (
            select(MessageORM)
            .where(MessageORM.conversation_id == conversation_id)
            .order_by(MessageORM.created_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        entity = result.scalars().first()
        if entity is None:
            return None
        return self.to_model(entity)

    async def get_unread_counts_bulk(
        self,
        conversation_ids: list[str],
        reader_id: str,
    ) -> dict[str, int]:
        """Return unread count per conversation using last_read_at from participants."""
        if not conversation_ids:
            return {}
        stmt = (
            select(MessageORM.conversation_id, func.count().label("cnt"))
            .join(
                ConversationParticipantORM,
                (ConversationParticipantORM.conversation_id == MessageORM.conversation_id)
                & (ConversationParticipantORM.tenant_id == reader_id),
            )
            .where(MessageORM.conversation_id.in_(conversation_ids))
            .where(MessageORM.sender_id != reader_id)
            .where(
                or_(
                    ConversationParticipantORM.last_read_at.is_(None),
                    MessageORM.created_at > ConversationParticipantORM.last_read_at,
                )
            )
            .group_by(MessageORM.conversation_id)
        )
        result = await self.session.execute(stmt)
        return {row.conversation_id: row.cnt for row in result.all()}

    async def create_message(
        self,
        conversation_id: str,
        sender_id: str,
        body: str,
    ) -> Message:
        entity = MessageORM(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            sender_id=sender_id,
            body=body,
        )
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return self.to_model(entity)
