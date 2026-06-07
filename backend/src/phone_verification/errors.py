from errors.base import BaseAppError, ErrorData


class PhoneVerificationError(BaseAppError):
    @classmethod
    def code_invalid(cls) -> "PhoneVerificationError":
        return cls(ErrorData(
            detail="Verification code is invalid or has expired",
            error_code="PHONE_CODE_INVALID",
            status_code=400,
        ))

    @classmethod
    def rate_limited(cls) -> "PhoneVerificationError":
        return cls(ErrorData(
            detail="Please wait before requesting another code",
            error_code="PHONE_RATE_LIMITED",
            status_code=429,
        ))

    @classmethod
    def send_failed(cls, detail: str) -> "PhoneVerificationError":
        return cls(ErrorData(
            detail=f"Failed to send SMS: {detail}",
            error_code="PHONE_SEND_FAILED",
            status_code=500,
            context={"twilio_error": detail},
        ))
