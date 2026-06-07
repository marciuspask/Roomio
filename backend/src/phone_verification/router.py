import structlog
from fastapi import APIRouter

from di import PhoneVerificationServiceDep
from phone_verification.models import (
    SendCodeRequest,
    SendCodeResponse,
    VerifyCodeRequest,
    VerifyCodeResponse,
)

logger = structlog.get_logger(__name__)

router = APIRouter(prefix="/api/v1/phone", tags=["phone-verification"])


@router.post("/send-code", response_model=SendCodeResponse)
async def send_code(
    body: SendCodeRequest,
    service: PhoneVerificationServiceDep,
) -> SendCodeResponse:
    await service.send_code(body.phone_number)
    return SendCodeResponse(message="Verification code sent")


@router.post("/verify-code", response_model=VerifyCodeResponse)
async def verify_code(
    body: VerifyCodeRequest,
    service: PhoneVerificationServiceDep,
) -> VerifyCodeResponse:
    await service.verify_code(body.phone_number, body.code)
    return VerifyCodeResponse(message="Phone number verified successfully", is_verified=True)
