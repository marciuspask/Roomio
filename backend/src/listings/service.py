import structlog

from common.database.unit_of_work import UnitOfWorkFactory
from listings.database.unit_of_work import ListingsUnitOfWork
from listings.errors import ListingError
from listings.models import Listing, ListingCreate, ListingUpdate
from models import AuthMethod, TenantContext, TenantType, UserRole

logger = structlog.get_logger(__name__)

# Minimal context used when creating a UoW for public (unauthenticated) queries.
# Public repository methods (get_all_active, get_public_by_id) never read tenant_id,
# so the value here is irrelevant — it only satisfies the UoW constructor signature.
_ANON_CONTEXT = TenantContext(
    tenant_id="",
    tenant_type=TenantType.USER,
    user_id="",
    username="",
    role=UserRole.USER,
    auth_method=AuthMethod.BEARER,
    is_admin=False,
)


class ListingsService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext | None = None,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context

    def _require_tenant(self) -> TenantContext:
        if self._tenant_context is None:
            raise RuntimeError("Authenticated tenant context required")
        return self._tenant_context

    def _uow(self, tenant_context: TenantContext | None = None):
        return self._uow_factory.create(
            ListingsUnitOfWork,
            tenant_context or self._tenant_context or _ANON_CONTEXT,
        )

    def _redact(self, listing: Listing) -> Listing:
        """Strip street_address unless the current tenant owns the listing."""
        viewer_id = self._tenant_context.tenant_id if self._tenant_context else None
        if viewer_id != listing.tenant_id:
            return listing.model_copy(update={"street_address": None})
        return listing

    # -- Public methods (no auth required) ------------------------------------

    async def get_all_listings(self) -> list[Listing]:
        """Return all active listings across all tenants."""
        async with self._uow() as uow:
            listings = await uow.listings.get_all_active()
        return [self._redact(listing) for listing in listings]

    async def get_listing(self, listing_id: str) -> Listing:
        """Return a single listing by ID, visible to anyone."""
        async with self._uow() as uow:
            listing = await uow.listings.get_public_by_id(listing_id)
        if listing is None:
            raise ListingError.not_found(listing_id)
        return self._redact(listing)

    # -- Tenant methods (auth required) ----------------------------------------

    async def get_my_listings(self) -> list[Listing]:
        """Return all listings owned by the current tenant."""
        tenant = self._require_tenant()
        async with self._uow(tenant) as uow:
            return await uow.listings.get_all_for_tenant()

    async def create_listing(self, data: ListingCreate) -> Listing:
        """Create a new listing for the current tenant."""
        tenant = self._require_tenant()
        async with self._uow(tenant) as uow:
            listing = await uow.listings.create_listing(data)
        logger.info("listing_created", tenant_id=tenant.tenant_id, listing_id=listing.id)
        return listing

    async def update_listing(self, listing_id: str, data: ListingUpdate) -> Listing:
        """Update a listing. Raises not_owner if the listing belongs to another tenant."""
        tenant = self._require_tenant()
        async with self._uow(tenant) as uow:
            existing = await uow.listings.get_public_by_id(listing_id)
            if existing is None:
                raise ListingError.not_found(listing_id)
            if existing.tenant_id != tenant.tenant_id:
                raise ListingError.not_owner(listing_id)
            updated = await uow.listings.update_listing(listing_id, data)
            if updated is None:
                raise ListingError.not_found(listing_id)
        logger.info("listing_updated", tenant_id=tenant.tenant_id, listing_id=listing_id)
        return updated

    async def delete_listing(self, listing_id: str) -> None:
        """Delete a listing. Raises not_owner if the listing belongs to another tenant."""
        tenant = self._require_tenant()
        async with self._uow(tenant) as uow:
            existing = await uow.listings.get_public_by_id(listing_id)
            if existing is None:
                raise ListingError.not_found(listing_id)
            if existing.tenant_id != tenant.tenant_id:
                raise ListingError.not_owner(listing_id)
            await uow.listings.delete_listing(listing_id)
        logger.info("listing_deleted", tenant_id=tenant.tenant_id, listing_id=listing_id)
