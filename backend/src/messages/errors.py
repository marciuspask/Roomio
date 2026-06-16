from errors.base import BaseAppError, ErrorData


class WsCloseCode:
    """Application-level WebSocket close codes (4000-4999 range).

    RFC 6455 reserves 4000-4999 for application use.
    """

    AUTH_FAILED = 4001  # invalid/missing JWT token
    FORBIDDEN = 4003  # user is not a participant
    NOT_FOUND = 4004  # conversation doesn't exist
    INTERNAL = 4011  # unexpected server failure


class MessageError(BaseAppError):
    @classmethod
    def not_found(cls, conversation_id: str) -> "MessageError":
        return cls(
            ErrorData(
                detail=f"Conversation not found: {conversation_id}",
                error_code="CONVERSATION_NOT_FOUND",
                status_code=404,
                context={"conversation_id": conversation_id},
            )
        )

    @classmethod
    def forbidden(cls, conversation_id: str) -> "MessageError":
        return cls(
            ErrorData(
                detail=f"Access denied to conversation: {conversation_id}",
                error_code="CONVERSATION_FORBIDDEN",
                status_code=403,
                context={"conversation_id": conversation_id},
            )
        )

    @classmethod
    def listing_not_found(cls, listing_id: str) -> "MessageError":
        return cls(
            ErrorData(
                detail=f"Listing not found: {listing_id}",
                error_code="LISTING_NOT_FOUND",
                status_code=404,
                context={"listing_id": listing_id},
            )
        )
