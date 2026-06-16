from pydantic import BaseModel


class CheckoutSessionCreate(BaseModel):
    listing_id: str


class CheckoutSessionResponse(BaseModel):
    checkout_url: str
