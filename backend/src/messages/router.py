import structlog
from fastapi import APIRouter

from di import MessagesServiceDep
from messages.models import (
    ConversationResponse,
    ConversationsResponse,
    MessageCreate,
    MessageResponse,
    MessagesResponse,
)

logger = structlog.get_logger(__name__)

router = APIRouter(tags=["messages"])
listings_router = APIRouter(prefix="/api/v1/listings", tags=["messages"])


@router.get("/api/v1/conversations/", response_model=ConversationsResponse)
async def get_my_conversations(service: MessagesServiceDep) -> ConversationsResponse:
    result = await service.get_my_conversations()
    return ConversationsResponse(data=result)


@router.get("/api/v1/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    service: MessagesServiceDep,
) -> ConversationResponse:
    result = await service.get_conversation(conversation_id)
    return ConversationResponse(data=result)


@router.get(
    "/api/v1/conversations/{conversation_id}/messages",
    response_model=MessagesResponse,
)
async def get_messages(
    conversation_id: str,
    service: MessagesServiceDep,
) -> MessagesResponse:
    result = await service.get_messages(conversation_id)
    return MessagesResponse(data=result)


@router.post(
    "/api/v1/conversations/{conversation_id}/read",
    status_code=204,
)
async def mark_as_read(
    conversation_id: str,
    service: MessagesServiceDep,
) -> None:
    await service.mark_as_read(conversation_id)


@router.post(
    "/api/v1/conversations/{conversation_id}/messages",
    response_model=MessageResponse,
    status_code=201,
)
async def send_message(
    conversation_id: str,
    body: MessageCreate,
    service: MessagesServiceDep,
) -> MessageResponse:
    msg = await service.send_message(conversation_id, body.body)
    return MessageResponse(data=msg)


@listings_router.post(
    "/{listing_id}/message",
    response_model=ConversationResponse,
    status_code=201,
)
async def start_conversation(
    listing_id: str,
    body: MessageCreate,
    service: MessagesServiceDep,
) -> ConversationResponse:
    result = await service.start_conversation(listing_id, body.body)
    return ConversationResponse(data=result)
