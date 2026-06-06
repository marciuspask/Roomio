from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.repository import TenantRepository
from listings.database.orm_models import ListingORM
from listings.models import Listing, ListingCreate, ListingUpdate
from models import TenantContext


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
        return self.to_model(entity)

    async def get_all_active(self, *, limit: int = 20, offset: int = 0) -> list[Listing]:
        """Get all active listings across all tenants — public, no tenant filter."""
        stmt = (
            select(ListingORM)
            .where(ListingORM.status == "active")
            .where(ListingORM.tenant_type == "user")
            .order_by(ListingORM.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        return self.to_model_list(list(result.scalars().all()))

    async def count_active(self) -> int:
        stmt = select(func.count()).where(ListingORM.status == "active")
        result = await self.session.execute(stmt)
        return result.scalar_one()

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
