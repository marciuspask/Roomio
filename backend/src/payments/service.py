import asyncio
from datetime import UTC, datetime, timedelta

import stripe
import structlog
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from config import Settings
from listings.database.orm_models import ListingORM
from models import TenantContext

logger = structlog.get_logger(__name__)


class PaymentsService:
    def __init__(
        self,
        settings: Settings,
        session_maker: async_sessionmaker[AsyncSession],
        tenant_context: TenantContext | None = None,
    ) -> None:
        stripe.api_key = settings.stripe_secret_key
        self._webhook_secret = settings.stripe_webhook_secret
        self._session_maker = session_maker
        self._tenant_context = tenant_context
        self._frontend_url = settings.frontend_url

    async def create_checkout_session(self, listing_id: str) -> str:
        if self._tenant_context is None:
            raise ValueError("tenant_context required for checkout")
        tenant_id = self._tenant_context.tenant_id

        def _call() -> stripe.checkout.Session:
            return stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": "eur",
                            "unit_amount": 300,
                            "product_data": {"name": "Listing Boost (7 days)"},
                        },
                        "quantity": 1,
                    }
                ],
                mode="payment",
                success_url=f"{self._frontend_url}/dashboard/listings?boosted=1",
                cancel_url=f"{self._frontend_url}/dashboard/listings",
                metadata={"listing_id": listing_id, "tenant_id": tenant_id},
            )

        session = await asyncio.to_thread(_call)
        return session.url or ""

    async def handle_webhook(self, payload: bytes, sig_header: str) -> None:
        event = stripe.Webhook.construct_event(payload, sig_header, self._webhook_secret)

        if event["type"] != "checkout.session.completed":
            return

        session_obj = event["data"]["object"]
        metadata = session_obj.get("metadata") or {}
        listing_id: str | None = metadata.get("listing_id")

        if not listing_id:
            logger.warning("webhook_missing_listing_id", event_id=event["id"])
            return

        async with self._session_maker() as db:
            entity = await db.get(ListingORM, listing_id)
            if entity is None:
                logger.warning("webhook_listing_not_found", listing_id=listing_id)
                return
            entity.is_boosted = True
            entity.is_boosted_until = datetime.now(UTC) + timedelta(days=7)
            await db.commit()
            logger.info("listing_boosted", listing_id=listing_id)
