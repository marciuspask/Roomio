from contextlib import AbstractAsyncContextManager

import structlog

from common.database.unit_of_work import UnitOfWorkFactory
from messages.database.unit_of_work import MessagesUnitOfWork
from messages.errors import MessageError
from messages.models import Conversation, Message
from models import TenantContext

logger = structlog.get_logger(__name__)


class MessagesService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context

    def _uow(self) -> AbstractAsyncContextManager[MessagesUnitOfWork]:
        return self._uow_factory.create(MessagesUnitOfWork, self._tenant_context)

    async def _enrich_conversations(
        self,
        uow: MessagesUnitOfWork,
        conversations: list[Conversation],
    ) -> list[Conversation]:
        if not conversations:
            return conversations

        conv_ids = [c.id for c in conversations]
        participant_map = await uow.participants.get_participant_ids_bulk(conv_ids)

        all_participant_ids = list({pid for pids in participant_map.values() for pid in pids})
        listing_ids = list({c.listing_id for c in conversations})

        profiles = await uow.profiles.get_by_tenant_ids_bulk(all_participant_ids)
        profiles_map = {p.tenant_id: p for p in profiles}

        titles_map = await uow.listings.get_titles_bulk(listing_ids)

        enriched = []
        for conv in conversations:
            participant_ids = participant_map.get(conv.id, [])
            display_names: dict[str, str] = {}
            ages: dict[str, int | None] = {}
            image_urls: dict[str, str | None] = {}
            for pid in participant_ids:
                p = profiles_map.get(pid)
                display_names[pid] = p.display_name if p and p.display_name else f"User …{pid[-6:]}"
                ages[pid] = p.age if p else None
                image_urls[pid] = p.image_url if p else None
            enriched.append(
                conv.model_copy(
                    update={
                        "participant_ids": participant_ids,
                        "listing_title": titles_map.get(conv.listing_id),
                        "participant_display_names": display_names,
                        "participant_ages": ages,
                        "participant_image_urls": image_urls,
                    }
                )
            )
        return enriched

    async def _is_participant(self, uow: MessagesUnitOfWork, conversation_id: str) -> bool:
        return await uow.participants.is_participant(conversation_id)

    async def get_my_conversations(
        self, limit: int = 20, offset: int = 0
    ) -> tuple[list[Conversation], int]:
        tenant_id = self._tenant_context.tenant_id
        async with self._uow() as uow:
            conv_ids = await uow.participants.get_my_conversation_ids()
            total = len(conv_ids)
            conversations = await uow.conversations.get_by_ids(conv_ids, limit=limit, offset=offset)
            page_ids = [c.id for c in conversations]
            last_messages = await uow.messages.get_last_messages_bulk(page_ids)
            unread_counts = await uow.messages.get_unread_counts_bulk(page_ids, tenant_id)
            base = [
                conv.model_copy(
                    update={
                        "last_message": last_messages.get(conv.id),
                        "unread_count": unread_counts.get(conv.id, 0),
                    }
                )
                for conv in conversations
            ]
            enriched = await self._enrich_conversations(uow, base)
        return (enriched, total)

    async def get_conversation(self, conversation_id: str) -> Conversation:
        async with self._uow() as uow:
            conv = await uow.conversations.get_by_id(conversation_id)
            if conv is None:
                raise MessageError.not_found(conversation_id)
            if not await self._is_participant(uow, conversation_id):
                raise MessageError.forbidden(conversation_id)
            last_msg = await uow.messages.get_last_message(conv.id)
            base = conv.model_copy(update={"last_message": last_msg})
            enriched = await self._enrich_conversations(uow, [base])
        return enriched[0]

    async def get_messages(
        self, conversation_id: str, limit: int = 50, offset: int = 0
    ) -> tuple[list[Message], int]:
        async with self._uow() as uow:
            conv = await uow.conversations.get_by_id(conversation_id)
            if conv is None:
                raise MessageError.not_found(conversation_id)
            if not await self._is_participant(uow, conversation_id):
                raise MessageError.forbidden(conversation_id)
            messages = await uow.messages.get_for_conversation(
                conversation_id, limit=limit, offset=offset
            )
            total = await uow.messages.count_messages(conversation_id)
        return (messages, total)

    async def start_conversation(
        self,
        listing_id: str,
        initial_message: str,
    ) -> Conversation:
        tenant_id = self._tenant_context.tenant_id

        async with self._uow() as uow:
            listing = await uow.listings.get_public_by_id(listing_id)
            if listing is None:
                raise MessageError.listing_not_found(listing_id)

            owner_id = listing.tenant_id
            if owner_id == tenant_id:
                raise MessageError.forbidden(listing_id)

            conv = await uow.conversations.get_between_participants(
                tenant_id,
                owner_id,
                listing_id,
            )
            if conv is None:
                conv = await uow.conversations.create_conversation(listing_id)
                await uow.participants.add_participants(
                    conv.id,
                    tenant_ids=[tenant_id, owner_id],
                    roles=["initiator", "owner"],
                )
            msg = await uow.messages.create_message(conv.id, tenant_id, initial_message)
            await uow.conversations.touch(conv.id)

        logger.info(
            "conversation_started",
            tenant_id=tenant_id,
            listing_id=listing_id,
            conversation_id=conv.id,
        )
        return conv.model_copy(update={"last_message": msg})

    async def mark_as_read(self, conversation_id: str) -> None:
        async with self._uow() as uow:
            conv = await uow.conversations.get_by_id(conversation_id)
            if conv is None:
                raise MessageError.not_found(conversation_id)
            if not await self._is_participant(uow, conversation_id):
                raise MessageError.forbidden(conversation_id)
            await uow.participants.mark_as_read(conversation_id)

    async def send_message(self, conversation_id: str, body: str) -> Message:
        tenant_id = self._tenant_context.tenant_id
        async with self._uow() as uow:
            conv = await uow.conversations.get_by_id(conversation_id)
            if conv is None:
                raise MessageError.not_found(conversation_id)
            if not await self._is_participant(uow, conversation_id):
                raise MessageError.forbidden(conversation_id)
            msg = await uow.messages.create_message(conversation_id, tenant_id, body)
            await uow.conversations.touch(conversation_id)

        logger.info(
            "message_sent",
            tenant_id=tenant_id,
            conversation_id=conversation_id,
            message_id=msg.id,
        )
        return msg
