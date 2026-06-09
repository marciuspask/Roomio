from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class ReportReason(StrEnum):
    SPAM = "SPAM"
    FAKE = "FAKE"
    INAPPROPRIATE = "INAPPROPRIATE"
    SCAM = "SCAM"
    OTHER = "OTHER"


class BlockCreate(BaseModel):
    blocked_tenant_id: str = Field(description="ID of the user to block")


class ReportCreate(BaseModel):
    target_type: Literal["listing", "user"] = Field(description="What is being reported")
    target_id: str = Field(description="ID of the listing or user being reported")
    reason: ReportReason = Field(description="Reason for the report")
    description: str = Field(default="", description="Optional details", max_length=2000)
