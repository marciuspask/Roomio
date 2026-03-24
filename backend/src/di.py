from typing import Annotated

from fastapi import Depends, Request

from auth.dependencies import get_tenant_context_from_header, require_admin
from common.database.unit_of_work import UnitOfWorkFactory
from listings.service import ListingsService
from models import TenantContext
from settings.service import SettingsService

TenantDep = Annotated[TenantContext, Depends(get_tenant_context_from_header)]
AdminDep = Annotated[TenantContext, Depends(require_admin)]


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
