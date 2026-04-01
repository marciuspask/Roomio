import structlog

from common.database.unit_of_work import UnitOfWorkFactory
from models import TenantContext
from saved.database.unit_of_work import SavedListingsUnitOfWork

logger = structlog.get_logger(__name__)


class SavedListingsService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context

    def _uow(self):
        return self._uow_factory.create(SavedListingsUnitOfWork, self._tenant_context)

    async def get_saved_ids(self) -> list[str]:
        """Return the listing IDs saved by the current tenant."""
        async with self._uow() as uow:
            saved = await uow.saved.get_saved_by_tenant()
        return [s.listing_id for s in saved]

    async def save_listing(self, listing_id: str) -> None:
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
