import structlog

from common.database.unit_of_work import UnitOfWorkFactory
from listings.database.unit_of_work import ListingsUnitOfWork
from messages.database.unit_of_work import MessagesUnitOfWork
from messages.errors import MessageError
from messages.models import Conversation, Message
from models import AuthMethod, TenantContext, TenantType, UserRole

logger = structlog.get_logger(__name__)

_ANON_CONTEXT = TenantContext(
    tenant_id="",
    tenant_type=TenantType.USER,
    user_id="",
    username="",
    email=None,
    role=UserRole.USER,
    auth_method=AuthMethod.BEARER,
    is_admin=False,
)


class MessagesService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context

    def _uow(self):
        return self._uow_factory.create(MessagesUnitOfWork)

    def _listing_uow(self):
        return self._uow_factory.create(ListingsUnitOfWork, _ANON_CONTEXT)

    def _is_participant(self, conversation: Conversation) -> bool:
        return self._tenant_context.tenant_id in conversation.participant_ids

    async def get_my_conversations(self) -> list[Conversation]:
        tenant_id = self._tenant_context.tenant_id
        async with self._uow() as uow:
            conversations = await uow.conversations.get_for_participant(tenant_id)
            last_messages = await uow.messages.get_last_messages_bulk(
                [c.id for c in conversations],
            )
        return [
            conv.model_copy(update={"last_message": last_messages.get(conv.id)})
            for conv in conversations
        ]

    async def get_conversation(self, conversation_id: str) -> Conversation:
        async with self._uow() as uow:
            conv = await uow.conversations.get_by_id(conversation_id)
            if conv is None:
                raise MessageError.not_found(conversation_id)
            if not self._is_participant(conv):
                raise MessageError.forbidden(conversation_id)
            last_msg = await uow.messages.get_last_message(conv.id)
        return conv.model_copy(update={"last_message": last_msg})

    async def get_messages(self, conversation_id: str) -> list[Message]:
        async with self._uow() as uow:
            conv = await uow.conversations.get_by_id(conversation_id)
            if conv is None:
                raise MessageError.not_found(conversation_id)
            if not self._is_participant(conv):
                raise MessageError.forbidden(conversation_id)
            return await uow.messages.get_for_conversation(conversation_id)

    async def start_conversation(
        self,
        listing_id: str,
        initial_message: str,
    ) -> Conversation:
        tenant_id = self._tenant_context.tenant_id

        async with self._listing_uow() as listing_uow:
            listing = await listing_uow.listings.get_public_by_id(listing_id)
        if listing is None:
            raise MessageError.listing_not_found(listing_id)

        owner_id = listing.tenant_id
        if owner_id == tenant_id:
            raise MessageError.forbidden(listing_id)

        async with self._uow() as uow:
            conv = await uow.conversations.get_between_participants(
                tenant_id, owner_id, listing_id,
            )
            if conv is None:
                conv = await uow.conversations.create_conversation(
                    listing_id, [tenant_id, owner_id],
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

    async def send_message(self, conversation_id: str, body: str) -> Message:
        tenant_id = self._tenant_context.tenant_id
        async with self._uow() as uow:
            conv = await uow.conversations.get_by_id(conversation_id)
            if conv is None:
                raise MessageError.not_found(conversation_id)
            if not self._is_participant(conv):
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
