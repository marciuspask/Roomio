import asyncio

import structlog
from twilio.rest import Client as TwilioClient

from common.database.unit_of_work import UnitOfWorkFactory
from config import Settings
from models import TenantContext
from phone_verification.database.unit_of_work import PhoneVerificationUnitOfWork
from phone_verification.errors import PhoneVerificationError
from profile.models import ProfileSystemUpdate, ProfileUpdate

logger = structlog.get_logger(__name__)


class PhoneVerificationService:
    def __init__(
        self,
        uow_factory: UnitOfWorkFactory,
        tenant_context: TenantContext,
        settings: Settings,
    ) -> None:
        self._uow_factory = uow_factory
        self._tenant_context = tenant_context
        self._twilio = TwilioClient(settings.twilio_account_sid, settings.twilio_auth_token)
        self._from_number = settings.twilio_phone_number

    async def send_code(self, phone_number: str) -> None:
        async with self._uow_factory.create(
            PhoneVerificationUnitOfWork, self._tenant_context,
        ) as uow:
            if await uow.verifications.has_recent_request(phone_number):
                raise PhoneVerificationError.rate_limited()
            code = await uow.verifications.create_code(phone_number)

        try:
            await asyncio.to_thread(
                self._twilio.messages.create,
                body=f"Your Roomio verification code is: {code}. Valid for 10 minutes.",
                from_=self._from_number,
                to=phone_number,
            )
            logger.info(
                "sms_sent",
                tenant_id=self._tenant_context.tenant_id,
                phone_prefix=phone_number[:6],
            )
        except Exception as e:
            logger.error("sms_send_failed", error=str(e))
            raise PhoneVerificationError.send_failed(str(e))

    async def verify_code(self, phone_number: str, code: str) -> None:
        async with self._uow_factory.create(
            PhoneVerificationUnitOfWork, self._tenant_context,
        ) as uow:
            record = await uow.verifications.find_valid(phone_number, code)
            if record is None:
                raise PhoneVerificationError.code_invalid()

            await uow.verifications.mark_used(record)

            profile = await uow.profiles.get_for_tenant()
            if profile is not None:
                await uow.profiles.update_profile(
                    profile.id,
                    ProfileUpdate(),
                    system_data=ProfileSystemUpdate(is_phone_verified=True),
                )

        logger.info("phone_verified", tenant_id=self._tenant_context.tenant_id)
