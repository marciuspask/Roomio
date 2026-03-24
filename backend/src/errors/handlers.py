import structlog
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from errors.base import BaseAppError
from errors.models import ErrorResponse

logger = structlog.get_logger(__name__)


async def base_app_error_handler(request: Request, exc: BaseAppError) -> JSONResponse:
    """Catches all BaseAppError subclasses → structured JSON."""
    logger.warning(
        "app_error",
        error_code=exc.error_code,
        status_code=exc.status_code,
        detail=exc.detail,
        path=request.url.path,
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            detail=exc.detail,
            error_code=exc.error_code,
            context=exc.context,
        ).model_dump(),
    )


async def pydantic_validation_error_handler(
    request: Request, exc: ValidationError,
) -> JSONResponse:
    """Catches Pydantic ValidationError → 422 JSON."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            detail="Validation failed",
            error_code="VALIDATION_ERROR",
            context={"errors": [dict(e) for e in exc.errors()]},
        ).model_dump(),
    )


async def request_validation_error_handler(
    request: Request, exc: RequestValidationError,
) -> JSONResponse:
    """Catches FastAPI RequestValidationError → 422 JSON."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            detail="Request validation failed",
            error_code="REQUEST_VALIDATION_ERROR",
            context={"errors": [dict(e) for e in exc.errors()]},
        ).model_dump(),
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unexpected errors → 500 JSON with details."""
    logger.error(
        "unhandled_exception",
        error_type=type(exc).__name__,
        error=str(exc),
        path=request.url.path,
        method=request.method,
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            detail="An unexpected error occurred",
            error_code="INTERNAL_SERVER_ERROR",
            context={
                "error": str(exc),
                "error_type": type(exc).__name__,
                "path": str(request.url.path),
                "method": request.method,
            },
        ).model_dump(),
    )
