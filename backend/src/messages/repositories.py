import uuid
from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.repository import BaseRepository
from messages.database.orm_models import ConversationORM, MessageORM
from messages.models import Conversation, Message


class ConversationRepository(BaseRepository[ConversationORM, Conversation]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, ConversationORM, Conversation)

    async def get_by_id(self, entity_id: str) -> Conversation | None:
        entity = await self.session.get(ConversationORM, entity_id)
        if entity is None:
            return None
        return self.to_model(entity)

    async def get_for_participant(self, tenant_id: str) -> list[Conversation]:
        stmt = (
            select(ConversationORM)
            .where(ConversationORM.participant_ids.contains([tenant_id]))
            .order_by(ConversationORM.updated_at.desc())
        )
        result = await self.session.execute(stmt)
        return self.to_model_list(list(result.scalars().all()))

    async def get_between_participants(
        self,
        tenant_id_1: str,
        tenant_id_2: str,
        listing_id: str,
    ) -> Conversation | None:
        stmt = (
            select(ConversationORM)
            .where(ConversationORM.listing_id == listing_id)
            .where(ConversationORM.participant_ids.contains([tenant_id_1]))
            .where(ConversationORM.participant_ids.contains([tenant_id_2]))
            .limit(1)
        )
        result = await self.session.execute(stmt)
        entity = result.scalars().first()
        if entity is None:
            return None
        return self.to_model(entity)

    async def create_conversation(
        self,
        listing_id: str,
        participant_ids: list[str],
    ) -> Conversation:
        entity = ConversationORM(
            id=str(uuid.uuid4()),
            listing_id=listing_id,
            participant_ids=participant_ids,
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

    async def get_for_conversation(self, conversation_id: str) -> list[Message]:
        stmt = (
            select(MessageORM)
            .where(MessageORM.conversation_id == conversation_id)
            .order_by(MessageORM.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return self.to_model_list(list(result.scalars().all()))

    async def get_last_messages_bulk(
        self, conversation_ids: list[str],
    ) -> dict[str, Message]:
        """Return the most recent message per conversation in one query.

        Uses a subquery to rank messages within each conversation, then
        filters to rank = 1. One DB round-trip regardless of list size.
        """
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
        stmt = select(MessageORM).join(
            ranked, MessageORM.id == ranked.c.id,
        ).where(ranked.c.rn == 1)

        result = await self.session.execute(stmt)
        return {
            entity.conversation_id: self.to_model(entity)
            for entity in result.scalars().all()
        }

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
