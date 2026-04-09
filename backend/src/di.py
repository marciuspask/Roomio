from typing import Annotated

from fastapi import Depends, Request

from auth.dependencies import TenantResolver, get_anonymous_context, get_tenant_context_from_header, require_admin
from common.database.unit_of_work import UnitOfWorkFactory
from listings.service import ListingsService
from messages.service import MessagesService
from migration.service import MigrationService
from messages.websocket import ConnectionManager
from models import TenantContext
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

def get_tenant_resolver(request: Request) -> TenantResolver:
    return request.app.state.tenant_resolver  # type: ignore[no-any-return]


def get_connection_manager(request: Request) -> ConnectionManager:
    return request.app.state.ws_manager  # type: ignore[no-any-return]


def get_ws_messages_service(request: Request, tenant: TenantContext) -> MessagesService:
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


# -- Migration ----------------------------------------------------------------

def get_migration_service(request: Request, tenant: TenantDep) -> MigrationService:
    session_maker = request.app.state.session_maker
    uow_factory = UnitOfWorkFactory(session_maker)
    return MigrationService(uow_factory=uow_factory, tenant_context=tenant)


MigrationServiceDep = Annotated[MigrationService, Depends(get_migration_service)]

