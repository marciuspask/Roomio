from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.repository import TenantRepository
from models import TenantContext
from saved.database.orm_models import SavedListingORM
from saved.models import SavedListing, SavedListingCreate


class SavedListingsRepository(TenantRepository[SavedListingORM, SavedListing]):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session, SavedListingORM, SavedListing, tenant_context)

    async def get_saved_by_tenant(self) -> list[SavedListing]:
        """Return all saved listings for the current tenant, newest first."""
        stmt = (
            select(SavedListingORM)
            .where(SavedListingORM.tenant_id == self._tenant_id)
            .order_by(SavedListingORM.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return self.to_model_list(list(result.scalars().all()))

    async def save_listing(self, listing_id: str) -> SavedListing:
        """Save a listing. Idempotent — returns existing record if already saved."""
        existing = await self._get_by_listing_id(listing_id)
        if existing is not None:
            return existing
        return await self._create(SavedListingCreate(listing_id=listing_id))

    async def unsave_listing(self, listing_id: str) -> None:
        """Remove a saved listing. Idempotent — no-op if not saved."""
        stmt = delete(SavedListingORM).where(
            SavedListingORM.tenant_id == self._tenant_id,
            SavedListingORM.listing_id == listing_id,
        )
        await self.session.execute(stmt)
        await self.session.flush()

    async def is_saved(self, listing_id: str) -> bool:
        return await self._get_by_listing_id(listing_id) is not None

    async def _get_by_listing_id(self, listing_id: str) -> SavedListing | None:
        stmt = (
            select(SavedListingORM)
            .where(SavedListingORM.tenant_id == self._tenant_id)
            .where(SavedListingORM.listing_id == listing_id)
            .limit(1)
        )
        result = await self.session.execute(stmt)
        entity = result.scalars().first()
        if entity is None:
            return None
        return self.to_model(entity)
