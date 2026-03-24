from dataclasses import dataclass, field
from typing import Any


@dataclass
class ErrorData:
    """Structured error data container.

    Every error in the app carries these four fields:
    - detail: what went wrong (human-readable)
    - error_code: what went wrong (machine-readable, e.g. "SETTINGS_NOT_FOUND")
    - status_code: HTTP status (404, 500, etc.)
    - context: extra info for debugging (always visible, never filtered)
    """

    detail: str
    error_code: str
    status_code: int
    context: dict[str, Any] = field(default_factory=dict)


class BaseAppError(Exception):
    """Base class for all application errors.

    All module errors inherit from this. Global exception handler catches it
    and returns a JSON response with the ErrorResponse shape.

    Usage — modules create their own subclass with @classmethod factories:

        class ProfileError(BaseAppError):
            @classmethod
            def not_found(cls, user_id: str) -> "ProfileError":
                return cls(ErrorData(
                    detail=f"Profile not found for user: {user_id}",
                    error_code="PROFILE_NOT_FOUND",
                    status_code=404,
                    context={"user_id": user_id},
                ))
    """

    def __init__(self, error_data: ErrorData) -> None:
        self.error_data = error_data
        super().__init__(error_data.detail)

    @property
    def detail(self) -> str:
        return self.error_data.detail

    @property
    def error_code(self) -> str:
        return self.error_data.error_code

    @property
    def status_code(self) -> int:
        return self.error_data.status_code

    @property
    def context(self) -> dict[str, Any]:
        return self.error_data.context
