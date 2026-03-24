import structlog

from common.database.unit_of_work import UnitOfWorkFactory
from models import TenantContext
from settings.database.unit_of_work import SettingsUnitOfWork
from settings.errors import SettingsError
from settings.models import Settings, SettingsUpdate

logger = structlog.get_logger(__name__)


class SettingsService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context

    async def get_or_create_settings(self) -> Settings:
        async with self._uow_factory.create(
            SettingsUnitOfWork, self._tenant_context,
        ) as uow:
            settings = await uow.settings.get_for_tenant()
            if settings is not None:
                return settings

            logger.info(
                "settings_creating_defaults",
                tenant_id=self._tenant_context.tenant_id,
            )
            return await uow.settings.create_settings(SettingsUpdate())

    async def update_settings(self, data: SettingsUpdate) -> Settings:
        async with self._uow_factory.create(
            SettingsUnitOfWork, self._tenant_context,
        ) as uow:
            existing = await uow.settings.get_for_tenant()
            if existing is None:
                raise SettingsError.not_found(self._tenant_context.tenant_id)

            updated = await uow.settings.update_settings(existing.id, data)
            if updated is None:
                raise SettingsError.update_failed("Update returned no result")

            logger.info(
                "settings_updated",
                tenant_id=self._tenant_context.tenant_id,
            )
            return updated
