from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.repository import TenantRepository
from listings.database.orm_models import ListingORM
from listings.models import Listing, ListingCreate, ListingUpdate
from models import TenantContext
from profile.database.orm_models import ProfileORM


class ListingsRepository(TenantRepository[ListingORM, Listing]):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session, ListingORM, Listing, tenant_context)

    async def get_all_for_tenant(self) -> list[Listing]:
        """Get all listings owned by the current tenant."""
        return await self.get_all()

    async def get_public_by_id(self, listing_id: str) -> Listing | None:
        """Get any listing by ID — no tenant filter, for public access and ownership checks."""
        entity = await self.session.get(ListingORM, listing_id)
        if entity is None:
            return None
        listing = self.to_model(entity)
        profile = await self.session.scalar(
            select(ProfileORM).where(ProfileORM.tenant_id == entity.tenant_id),
        )
        if profile:
            listing.poster_display_name = profile.display_name
            listing.poster_image_url = profile.image_url
            listing.poster_age = profile.age
        return listing

    async def get_all_active(self) -> list[Listing]:
        """Get all active listings across all tenants — public, no tenant filter."""
        stmt = select(ListingORM).where(ListingORM.status == "active")
        result = await self.session.execute(stmt)
        orm_listings = list(result.scalars().all())
        listings = self.to_model_list(orm_listings)

        if not listings:
            return listings

        tenant_ids = list({listing.tenant_id for listing in listings})
        profiles_result = await self.session.execute(
            select(ProfileORM).where(ProfileORM.tenant_id.in_(tenant_ids)),
        )
        profiles_by_tenant = {p.tenant_id: p for p in profiles_result.scalars().all()}

        for listing in listings:
            profile = profiles_by_tenant.get(listing.tenant_id)
            if profile:
                listing.poster_display_name = profile.display_name
                listing.poster_image_url = profile.image_url
                listing.poster_age = profile.age

        return listings

    async def get_titles_bulk(self, listing_ids: list[str]) -> dict[str, str]:
        """Return title keyed by listing_id for a set of IDs in one query."""
        if not listing_ids:
            return {}
        stmt = select(ListingORM.id, ListingORM.title).where(ListingORM.id.in_(listing_ids))
        result = await self.session.execute(stmt)
        return {row.id: row.title for row in result.all()}

    async def create_listing(self, data: ListingCreate) -> Listing:
        """Create a listing. tenant_id is auto-injected by TenantRepository."""
        return await self._create(data)

    async def update_listing(self, listing_id: str, data: ListingUpdate) -> Listing | None:
        """Update a listing. Returns None if not found or not owned by tenant."""
        return await self._update(listing_id, data)

    async def delete_listing(self, listing_id: str) -> bool:
        """Hard-delete a listing. Returns False if not found or not owned by tenant."""
        return await self.delete(listing_id, soft=False)
