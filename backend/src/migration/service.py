import structlog

from common.database.unit_of_work import UnitOfWorkFactory
from models import TenantContext, TenantType
from saved.database.unit_of_work import SavedListingsUnitOfWork

logger = structlog.get_logger(__name__)


class MigrationService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context

    async def convert_anonymous_to_registered(self, anonymous_id: str) -> None:
        """Migrate all data from an anonymous UID to the newly registered tenant."""
        registered_context = self._tenant_context
        async with self._uow_factory.create(
            SavedListingsUnitOfWork, registered_context,
        ) as uow:
            migrated = await uow.saved.migrate_tenant(
                old_tenant_id=anonymous_id,
                new_tenant_id=registered_context.tenant_id,
                new_tenant_type=TenantType.USER,
            )
        logger.info(
            "anonymous_converted",
            anonymous_id=anonymous_id,
            new_tenant_id=registered_context.tenant_id,
            saved_migrated=migrated,
        )
