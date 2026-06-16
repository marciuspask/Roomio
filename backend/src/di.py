from typing import Annotated

from fastapi import Depends, Request, WebSocket

from auth.dependencies import (
    TenantResolver,
    get_anonymous_context,
    get_tenant_context_from_header,
    require_admin,
)
from common.database.unit_of_work import UnitOfWorkFactory
from listings.service import ListingsService
from messages.service import MessagesService
from messages.websocket import ConnectionManager
from migration.service import MigrationService
from models import TenantContext
from moderation.service import ModerationService
from payments.service import PaymentsService
from phone_verification.service import PhoneVerificationService
from profile.service import ProfileService
from saved.service import SavedListingsService
from settings.service import SettingsService

TenantDep = Annotated[TenantContext, Depends(get_tenant_context_from_header)]
AdminDep = Annotated[TenantContext, Depends(require_admin)]


# -- Profile ------------------------------------------------------------------


def get_profile_service(request: Request, tenant: TenantDep) -> ProfileService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return ProfileService(uow_factory=uow_factory, tenant_context=tenant)


ProfileServiceDep = Annotated[ProfileService, Depends(get_profile_service)]


def get_public_profile_service(request: Request) -> ProfileService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return ProfileService(uow_factory=uow_factory, tenant_context=get_anonymous_context())


PublicProfileServiceDep = Annotated[ProfileService, Depends(get_public_profile_service)]


# -- Settings -----------------------------------------------------------------


def get_settings_service(request: Request, tenant: TenantDep) -> SettingsService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return SettingsService(uow_factory=uow_factory, tenant_context=tenant)


SettingsServiceDep = Annotated[SettingsService, Depends(get_settings_service)]


# -- Listings -----------------------------------------------------------------


def get_listings_service(request: Request, tenant: TenantDep) -> ListingsService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return ListingsService(uow_factory=uow_factory, tenant_context=tenant)


def get_public_listings_service(request: Request) -> ListingsService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return ListingsService(uow_factory=uow_factory, tenant_context=None)


ListingsServiceDep = Annotated[ListingsService, Depends(get_listings_service)]
PublicListingsServiceDep = Annotated[ListingsService, Depends(get_public_listings_service)]


# -- WebSocket helpers --------------------------------------------------------


def get_tenant_resolver(request: Request | WebSocket) -> TenantResolver:
    return request.app.state.tenant_resolver  # type: ignore[no-any-return]


def get_connection_manager(request: Request | WebSocket) -> ConnectionManager:
    return request.app.state.ws_manager  # type: ignore[no-any-return]


def get_ws_messages_service(request: Request | WebSocket, tenant: TenantContext) -> MessagesService:
    """Build MessagesService for WebSocket handlers. Same wiring as HTTP."""
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return MessagesService(uow_factory=uow_factory, tenant_context=tenant)


ConnectionManagerDep = Annotated[ConnectionManager, Depends(get_connection_manager)]


# -- Messages -----------------------------------------------------------------


def get_messages_service(request: Request, tenant: TenantDep) -> MessagesService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return MessagesService(uow_factory=uow_factory, tenant_context=tenant)


MessagesServiceDep = Annotated[MessagesService, Depends(get_messages_service)]


# -- Saved listings -----------------------------------------------------------


def get_saved_listings_service(request: Request, tenant: TenantDep) -> SavedListingsService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return SavedListingsService(uow_factory=uow_factory, tenant_context=tenant)


SavedListingsServiceDep = Annotated[SavedListingsService, Depends(get_saved_listings_service)]


# -- Phone verification -------------------------------------------------------


def get_phone_verification_service(request: Request, tenant: TenantDep) -> PhoneVerificationService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    config = request.app.state.config
    return PhoneVerificationService(uow_factory=uow_factory, tenant_context=tenant, settings=config)


PhoneVerificationServiceDep = Annotated[
    PhoneVerificationService, Depends(get_phone_verification_service)
]


# -- Moderation ---------------------------------------------------------------


def get_moderation_service(request: Request, tenant: TenantDep) -> ModerationService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return ModerationService(uow_factory=uow_factory, tenant_context=tenant)


ModerationServiceDep = Annotated[ModerationService, Depends(get_moderation_service)]


# -- Migration ----------------------------------------------------------------


def get_migration_service(request: Request, tenant: TenantDep) -> MigrationService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return MigrationService(uow_factory=uow_factory, tenant_context=tenant)


MigrationServiceDep = Annotated[MigrationService, Depends(get_migration_service)]


# -- Payments -----------------------------------------------------------------


def get_payments_service(request: Request, tenant: TenantDep) -> PaymentsService:
    return PaymentsService(
        settings=request.app.state.config,
        session_maker=request.app.state.session_maker,
        tenant_context=tenant,
    )


def get_webhook_payments_service(request: Request) -> PaymentsService:
    return PaymentsService(
        settings=request.app.state.config,
        session_maker=request.app.state.session_maker,
    )


PaymentsServiceDep = Annotated[PaymentsService, Depends(get_payments_service)]
WebhookPaymentsServiceDep = Annotated[PaymentsService, Depends(get_webhook_payments_service)]
