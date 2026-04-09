from datetime import date

import structlog

from common.database.unit_of_work import UnitOfWorkFactory
from auth.dependencies import get_anonymous_context
from models import TenantContext
from profile.database.unit_of_work import ProfileUnitOfWork
from profile.errors import ProfileError
from profile.models import Profile, ProfileSystemUpdate, ProfileUpdate

logger = structlog.get_logger(__name__)


class ProfileService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context

    async def get_or_create_profile(self) -> Profile:
        async with self._uow_factory.create(
            ProfileUnitOfWork, self._tenant_context,
        ) as uow:
            profile = await uow.profile.get_for_tenant()
            if profile is not None:
                return profile

            logger.info(
                "profile_creating_defaults",
                tenant_id=self._tenant_context.tenant_id,
            )
            return await uow.profile.create_profile(
                ProfileUpdate(display_name=self._tenant_context.username),
                system_data=ProfileSystemUpdate(email=self._tenant_context.email),
            )

    async def update_profile(self, data: ProfileUpdate) -> Profile:
        system_update: ProfileSystemUpdate | None = None
        if data.date_of_birth is not None:
            today = date.today()
            dob = data.date_of_birth
            computed_age = (
                today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
            )
            if computed_age < 18:
                raise ProfileError.underage()
            system_update = ProfileSystemUpdate(age=computed_age)

        async with self._uow_factory.create(
            ProfileUnitOfWork, self._tenant_context,
        ) as uow:
            existing = await uow.profile.get_for_tenant()
            if existing is None:
                raise ProfileError.not_found(self._tenant_context.tenant_id)

            updated = await uow.profile.update_profile(existing.id, data, system_update)
            if updated is None:
                raise ProfileError.update_failed(self._tenant_context.tenant_id)

            logger.info(
                "profile_updated",
                tenant_id=self._tenant_context.tenant_id,
            )
            return updated

    async def get_public_profile(self, user_id: str) -> Profile:
        """Fetch any user's profile by their tenant_id. No auth required."""
        async with self._uow_factory.create(
            ProfileUnitOfWork, get_anonymous_context(),
        ) as uow:
            profile = await uow.profile.get_by_tenant_id(user_id)
            if profile is None:
                raise ProfileError.not_found(user_id)
            return profile
