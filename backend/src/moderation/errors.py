from errors.base import BaseAppError, ErrorData


class ModerationError(BaseAppError):
    @classmethod
    def cannot_block_self(cls) -> "ModerationError":
        return cls(
            ErrorData(
                detail="You cannot block yourself.",
                error_code="CANNOT_BLOCK_SELF",
                status_code=400,
            )
        )
