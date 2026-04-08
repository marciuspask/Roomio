import json

import structlog
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status

from auth.dependencies import AuthError, TenantResolver
from common.database.unit_of_work import UnitOfWorkFactory
from di import MessagesServiceDep
from messages.errors import MessageError
from messages.models import (
    ConversationResponse,
    ConversationsResponse,
    MessageCreate,
    MessageResponse,
    MessagesResponse,
)
from messages.service import MessagesService
from messages.websocket import ConnectionManager

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
    status_code=status.HTTP_204_NO_CONTENT,
)
async def mark_as_read(
    conversation_id: str,
    service: MessagesServiceDep,
) -> None:
    await service.mark_as_read(conversation_id)


@router.post(
    "/api/v1/conversations/{conversation_id}/messages",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
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
    status_code=status.HTTP_201_CREATED,
)
async def start_conversation(
    listing_id: str,
    body: MessageCreate,
    service: MessagesServiceDep,
) -> ConversationResponse:
    result = await service.start_conversation(listing_id, body.body)
    return ConversationResponse(data=result)


@router.websocket("/api/v1/ws/conversations/{conversation_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: str,
    token: str = Query(...),
) -> None:
    resolver: TenantResolver = websocket.app.state.tenant_resolver  # type: ignore[attr-defined]
    try:
        tenant = resolver.get_tenant_context(f"Bearer {token}")
    except AuthError:
        await websocket.close(code=4001)
        return

    manager: ConnectionManager = websocket.app.state.ws_manager  # type: ignore[attr-defined]
    session_maker = websocket.app.state.session_maker  # type: ignore[attr-defined]
    uow_factory = UnitOfWorkFactory(session_maker)
    service = MessagesService(uow_factory=uow_factory, tenant_context=tenant)

    try:
        await service.get_conversation(conversation_id)
    except (MessageError, Exception):
        await websocket.close(code=4004)
        return

    await manager.connect(websocket, conversation_id)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
                body = str(payload.get("body", "")).strip()
                if not body:
                    continue
                msg = await service.send_message(conversation_id, body)
                await manager.broadcast(msg.model_dump_json(), conversation_id)
            except (MessageError, ValueError, KeyError) as exc:
                logger.warning("ws_message_error", error=str(exc))
    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id)
