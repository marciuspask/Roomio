from contextlib import AbstractAsyncContextManager

import structlog

from auth.dependencies import AuthError, get_anonymous_context
from common.database.unit_of_work import UnitOfWorkFactory
from listings.database.unit_of_work import ListingsUnitOfWork
from listings.errors import ListingError
from listings.models import Listing, ListingCreate, ListingUpdate
from models import TenantContext
from profile.models import Profile

logger = structlog.get_logger(__name__)


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
            raise AuthError.missing_token()
        return self._tenant_context

    def _uow(
        self, tenant_context: TenantContext | None = None
    ) -> AbstractAsyncContextManager[ListingsUnitOfWork]:
        return self._uow_factory.create(
            ListingsUnitOfWork,
            tenant_context or self._tenant_context or get_anonymous_context(),
        )

    def _redact(self, listing: Listing) -> Listing:
        """Strip street_address unless the current tenant owns the listing."""
        viewer_id = self._tenant_context.tenant_id if self._tenant_context else None
        if viewer_id != listing.tenant_id:
            return listing.model_copy(update={"street_address": None})
        return listing

    def _enrich(self, listing: Listing, profiles_map: dict[str, Profile]) -> Listing:
        """Attach poster profile fields to the listing."""
        profile = profiles_map.get(listing.tenant_id)
        if profile is None:
            return listing
        return listing.model_copy(
            update={
                "poster_display_name": profile.display_name,
                "poster_image_url": profile.image_url,
                "poster_age": profile.age,
                "poster_phone_verified": profile.is_phone_verified,
                "poster_email_verified": profile.is_email_verified,
            }
        )

    # -- Public methods (no auth required) ------------------------------------

    async def get_all_listings(self, limit: int = 20, offset: int = 0) -> tuple[list[Listing], int]:
        """Return all active listings across all tenants."""
        async with self._uow() as uow:
            listings = await uow.listings.get_all_active(limit=limit, offset=offset)
            total = await uow.listings.count_active()
            tenant_ids = list({listing.tenant_id for listing in listings})
            profiles = await uow.profiles.get_by_tenant_ids_bulk(tenant_ids)
        profiles_map = {p.tenant_id: p for p in profiles}
        return ([self._enrich(self._redact(listing), profiles_map) for listing in listings], total)

    async def get_listing(self, listing_id: str) -> Listing:
        """Return a single listing by ID, visible to anyone."""
        async with self._uow() as uow:
            listing = await uow.listings.get_public_by_id(listing_id)
            if listing is None:
                raise ListingError.not_found(listing_id)
            profiles = await uow.profiles.get_by_tenant_ids_bulk([listing.tenant_id])
        profiles_map = {p.tenant_id: p for p in profiles}
        return self._enrich(self._redact(listing), profiles_map)

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
