import uuid
from typing import Annotated

import structlog
from clerk_backend_api import AuthenticateRequestOptions, Clerk
from fastapi import Depends, Header, Request

from errors.base import BaseAppError, ErrorData
from models import AuthMethod, TenantContext, TenantType, UserRole

logger = structlog.get_logger(__name__)

# Emails granted admin access. Add your own email here during development.
ADMIN_EMAILS: set[str] = {"marcius.pask@gmail.com"}


class AuthError(BaseAppError):
    @classmethod
    def missing_token(cls) -> "AuthError":
        return cls(
            ErrorData(
                detail="Authentication required",
                error_code="MISSING_TOKEN",
                status_code=401,
            )
        )

    @classmethod
    def invalid_token(cls) -> "AuthError":
        return cls(
            ErrorData(
                detail="Invalid or expired token",
                error_code="INVALID_TOKEN",
                status_code=401,
            )
        )

    @classmethod
    def forbidden(cls) -> "AuthError":
        return cls(
            ErrorData(
                detail="Admin access required",
                error_code="FORBIDDEN",
                status_code=403,
            )
        )


class _AuthHeaderRequest:
    """Minimal Requestish adapter — wraps a raw Authorization header value."""

    def __init__(self, authorization: str) -> None:
        self._authorization = authorization

    @property
    def headers(self) -> dict[str, str]:
        return {"Authorization": self._authorization}


class TenantResolver:
    """Verifies Clerk JWT tokens and returns a TenantContext.

    Stored in app.state at startup so it is created once and reused.
    Each request calls get_tenant_context() with the raw Authorization header.
    """

    def __init__(self, clerk_client: Clerk) -> None:
        self._clerk = clerk_client

    def get_tenant_context(self, authorization: str | None) -> TenantContext:
        if not authorization or not authorization.startswith("Bearer "):
            logger.warning("auth_missing_token")
            raise AuthError.missing_token()

        try:
            state = self._clerk.authenticate_request(
                _AuthHeaderRequest(authorization),
                AuthenticateRequestOptions(),
            )

            if not state.is_signed_in or state.payload is None:
                logger.warning("auth_invalid_token", reason=state.reason)
                raise AuthError.invalid_token()

            payload = state.payload
            user_id: str = payload["sub"]
            email: str | None = payload.get("email")
            username: str = payload.get("name") or payload.get("username") or email or user_id
            is_admin = email is not None and email in ADMIN_EMAILS

            logger.info("auth_success", user_id=user_id, is_admin=is_admin)

            return TenantContext(
                tenant_id=user_id,
                tenant_type=TenantType.USER,
                user_id=user_id,
                username=username,
                email=email,
                role=UserRole.ADMIN if is_admin else UserRole.USER,
                auth_method=AuthMethod.BEARER,
                is_admin=is_admin,
            )

        except AuthError:
            raise
        except Exception as e:
            logger.warning("auth_verification_failed", error=str(e))
            raise AuthError.invalid_token() from None


def get_anonymous_context(
    x_anonymous_id: Annotated[str | None, Header()] = None,
) -> TenantContext:
    """Build an anonymous TenantContext from client-provided header.

    The client sends X-Anonymous-Id (a UUID generated once in localStorage).
    If missing, generate a transient one for this request only.
    """
    anon_id = x_anonymous_id or f"anon-{uuid.uuid4()}"
    return TenantContext(
        tenant_id=anon_id,
        tenant_type=TenantType.ANONYMOUS,
        user_id=anon_id,
        username="Anonymous",
        email=None,
        role=UserRole.USER,
        auth_method=AuthMethod.ANONYMOUS,
        is_admin=False,
    )


def get_tenant_context_from_header(
    request: Request,
    authorization: Annotated[str | None, Header()] = None,
) -> TenantContext:
    resolver: TenantResolver = request.app.state.tenant_resolver
    return resolver.get_tenant_context(authorization)


def require_admin(
    tenant: Annotated[TenantContext, Depends(get_tenant_context_from_header)],
) -> TenantContext:
    if not tenant.is_admin:
        logger.warning("auth_forbidden", user_id=tenant.user_id)
        raise AuthError.forbidden()
    return tenant
