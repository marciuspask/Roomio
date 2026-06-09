from enum import StrEnum

from pydantic import BaseModel, Field


class FeedbackType(StrEnum):
    BUG = "Bug"
    SUGGESTION = "Suggestion"
    OTHER = "Other"


class FeedbackCreate(BaseModel):
    type: FeedbackType = Field(description="Type of feedback")
    subject: str = Field(description="Short subject line", min_length=1, max_length=200)
    description: str = Field(description="Detailed description", min_length=1, max_length=5000)
