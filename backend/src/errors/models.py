from typing import Any

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    """Standard error response — every API error returns this shape.

    {
        "detail": "Profile not found for user: user_123",
        "error_code": "PROFILE_NOT_FOUND",
        "context": {"user_id": "user_123"}
    }
    """

    detail: str = Field(..., description="Human-readable error message")
    error_code: str = Field(..., description="Machine-readable error code")
    context: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional error context (always visible)",
    )
