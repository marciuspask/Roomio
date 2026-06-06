import json

import structlog
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status

from auth.dependencies import AuthError
from di import (
    MessagesServiceDep,
    get_connection_manager,
    get_tenant_resolver,
    get_ws_messages_service,
)
from messages.errors import MessageError, WsCloseCode
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
async def get_my_conversations(
    service: MessagesServiceDep,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> ConversationsResponse:
    conversations, total = await service.get_my_conversations(limit=limit, offset=offset)
    return ConversationsResponse(data=conversations, total=total, limit=limit, offset=offset)


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
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> MessagesResponse:
    messages, total = await service.get_messages(conversation_id, limit=limit, offset=offset)
    return MessagesResponse(data=messages, total=total, limit=limit, offset=offset)


@router.post(
    "/api/v1/conversations/{conversation_id}/read",
    response_model=None,
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
    await websocket.accept()

    try:
        tenant = get_tenant_resolver(websocket).get_tenant_context(f"Bearer {token}")
    except AuthError:
        await websocket.close(code=WsCloseCode.AUTH_FAILED)
        return

    manager = get_connection_manager(websocket)
    service = get_ws_messages_service(websocket, tenant)

    try:
        await service.get_conversation(conversation_id)
    except MessageError as exc:
        await websocket.close(code=WsCloseCode.NOT_FOUND, reason=exc.error_code)
        return
    except Exception:
        logger.error("ws_connect_failed", conversation_id=conversation_id, exc_info=True)
        await websocket.close(code=WsCloseCode.INTERNAL)
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
