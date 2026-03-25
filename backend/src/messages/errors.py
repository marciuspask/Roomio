from errors.base import BaseAppError, ErrorData


class MessageError(BaseAppError):
    @classmethod
    def not_found(cls, conversation_id: str) -> "MessageError":
        return cls(ErrorData(
            detail=f"Conversation not found: {conversation_id}",
            error_code="CONVERSATION_NOT_FOUND",
            status_code=404,
            context={"conversation_id": conversation_id},
        ))

    @classmethod
    def forbidden(cls, conversation_id: str) -> "MessageError":
        return cls(ErrorData(
            detail=f"Access denied to conversation: {conversation_id}",
            error_code="CONVERSATION_FORBIDDEN",
            status_code=403,
            context={"conversation_id": conversation_id},
        ))

    @classmethod
    def listing_not_found(cls, listing_id: str) -> "MessageError":
        return cls(ErrorData(
            detail=f"Listing not found: {listing_id}",
            error_code="LISTING_NOT_FOUND",
            status_code=404,
            context={"listing_id": listing_id},
        ))
