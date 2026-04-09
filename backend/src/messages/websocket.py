import structlog
from fastapi import WebSocket

logger = structlog.get_logger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, conversation_id: str) -> None:
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)
        logger.info("ws_connected", conversation_id=conversation_id)

    def disconnect(self, websocket: WebSocket, conversation_id: str) -> None:
        conns = self.active_connections.get(conversation_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self.active_connections.pop(conversation_id, None)
        logger.info("ws_disconnected", conversation_id=conversation_id)

    async def broadcast(self, message_data: str, conversation_id: str) -> None:
        conns = list(self.active_connections.get(conversation_id, []))
        for connection in conns:
            try:
                await connection.send_text(message_data)
            except Exception:
                logger.warning(
                    "ws_broadcast_failed",
                    conversation_id=conversation_id,
                    exc_info=True,
                )
                self.disconnect(connection, conversation_id)
