from contextlib import AbstractAsyncContextManager

import structlog

from auth.dependencies import get_anonymous_context
from common.database.unit_of_work import UnitOfWorkFactory
from listings.database.unit_of_work import ListingsUnitOfWork
from models import TenantContext
from saved.database.unit_of_work import SavedListingsUnitOfWork
from saved.errors import SavedListingError

logger = structlog.get_logger(__name__)


class SavedListingsService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context

    def _uow(self) -> AbstractAsyncContextManager[SavedListingsUnitOfWork]:
        return self._uow_factory.create(SavedListingsUnitOfWork, self._tenant_context)

    def _listing_uow(self) -> AbstractAsyncContextManager[ListingsUnitOfWork]:
        return self._uow_factory.create(ListingsUnitOfWork, get_anonymous_context())

    async def get_saved_ids(self) -> list[str]:
        """Return the listing IDs saved by the current tenant."""
        async with self._uow() as uow:
            saved = await uow.saved.get_saved_by_tenant()
        return [s.listing_id for s in saved]

    async def save_listing(self, listing_id: str) -> None:
        async with self._listing_uow() as uow:
            listing = await uow.listings.get_public_by_id(listing_id)
        if listing is None:
            raise SavedListingError.listing_not_found(listing_id)

        async with self._uow() as uow:
            await uow.saved.save_listing(listing_id)
        logger.info(
            "listing_saved",
            tenant_id=self._tenant_context.tenant_id,
            listing_id=listing_id,
        )

    async def unsave_listing(self, listing_id: str) -> None:
        async with self._uow() as uow:
            await uow.saved.unsave_listing(listing_id)
        logger.info(
            "listing_unsaved",
            tenant_id=self._tenant_context.tenant_id,
            listing_id=listing_id,
        )
