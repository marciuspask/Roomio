from pydantic import BaseModel, Field


class SendCodeRequest(BaseModel):
    phone_number: str = Field(description="Phone number with country code, e.g. +37061234567")


class VerifyCodeRequest(BaseModel):
    phone_number: str = Field(description="Phone number that received the code")
    code: str = Field(min_length=6, max_length=6, description="6-digit verification code")


class SendCodeResponse(BaseModel):
    message: str


class VerifyCodeResponse(BaseModel):
    message: str
    is_verified: bool
