from contextlib import AbstractAsyncContextManager

import sentry_sdk
import structlog

from common.database.unit_of_work import UnitOfWorkFactory
from models import TenantContext
from moderation.database.unit_of_work import ModerationUnitOfWork
from moderation.errors import ModerationError
from moderation.models import ReportCreate

logger = structlog.get_logger(__name__)


class ModerationService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context

    def _uow(self) -> AbstractAsyncContextManager[ModerationUnitOfWork]:
        return self._uow_factory.create(ModerationUnitOfWork, self._tenant_context)

    async def block_user(self, blocked_id: str) -> None:
        if blocked_id == self._tenant_context.tenant_id:
            raise ModerationError.cannot_block_self()
        async with self._uow() as uow:
            await uow.blocks.block_user(blocked_id)
        logger.info("user_blocked", blocker=self._tenant_context.tenant_id, blocked=blocked_id)

    async def unblock_user(self, blocked_id: str) -> None:
        async with self._uow() as uow:
            await uow.blocks.unblock_user(blocked_id)
        logger.info("user_unblocked", blocker=self._tenant_context.tenant_id, blocked=blocked_id)

    async def report(self, data: ReportCreate) -> None:
        async with self._uow() as uow:
            await uow.reports.create_report(data)

        logger.info(
            "report_created",
            reporter=self._tenant_context.tenant_id,
            target_type=data.target_type,
            target_id=data.target_id,
            reason=data.reason,
        )

        with sentry_sdk.new_scope() as scope:
            scope.set_tag("report.type", data.target_type)
            scope.set_tag("report.reason", data.reason)
            scope.set_context("report", {
                "reporter_id": self._tenant_context.tenant_id,
                "target_type": data.target_type,
                "target_id": data.target_id,
                "reason": data.reason,
                "description": data.description,
            })
            sentry_sdk.capture_message(
                f"[Report] {data.target_type} — {data.reason}: {data.target_id}",
                level="warning",
            )
