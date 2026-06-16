import stripe
import structlog
from fastapi import APIRouter, HTTPException, Request, status

from di import PaymentsServiceDep, WebhookPaymentsServiceDep
from payments.models import CheckoutSessionCreate, CheckoutSessionResponse

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])
logger = structlog.get_logger(__name__)


@router.post(
    "/checkout",
    response_model=CheckoutSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_checkout(
    body: CheckoutSessionCreate,
    service: PaymentsServiceDep,
) -> CheckoutSessionResponse:
    url = await service.create_checkout_session(body.listing_id)
    return CheckoutSessionResponse(checkout_url=url)


@router.post("/webhook", response_model=None, status_code=status.HTTP_200_OK)
async def stripe_webhook(
    request: Request,
    service: WebhookPaymentsServiceDep,
) -> dict[str, bool]:
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    try:
        await service.handle_webhook(payload, sig_header)
    except stripe.SignatureVerificationError as err:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature") from err
    return {"received": True}
