from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class ConversationStatus(StrEnum):
    ACTIVE = "active"
    ARCHIVED = "archived"


class Message(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Unique message identifier (UUID)")
    conversation_id: str = Field(description="Conversation this message belongs to")
    sender_id: str = Field(description="Tenant identifier of the user who sent the message")
    body: str = Field(description="Text content of the message")
    created_at: datetime = Field(description="Timestamp when the message was sent")


class Conversation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(description="Unique conversation identifier (UUID)")
    listing_id: str = Field(description="Identifier of the listing this conversation is about")
    participant_ids: list[str] = Field(description="Tenant IDs of both participants")
    status: ConversationStatus = Field(description="Current status of the conversation")
    last_message: Message | None = Field(default=None, description="Most recent message")
    unread_count: int = Field(default=0, description="Unread message count for the requesting user")
    listing_title: str | None = Field(
        default=None, description="Title of the listing this conversation is about",
    )
    participant_display_names: dict[str, str] = Field(
        default_factory=dict, description="Display name keyed by tenant_id",
    )
    participant_ages: dict[str, int | None] = Field(
        default_factory=dict, description="Age keyed by tenant_id",
    )
    participant_image_urls: dict[str, str | None] = Field(
        default_factory=dict, description="Avatar URL keyed by tenant_id",
    )
    created_at: datetime = Field(description="Timestamp when the conversation was created")
    updated_at: datetime = Field(description="Timestamp when the conversation was last updated")


class MessageCreate(BaseModel):
    body: str = Field(max_length=2000, description="Text content of the message")


class MessageResponse(BaseModel):
    data: Message = Field(description="The message data")


class ConversationResponse(BaseModel):
    data: Conversation = Field(description="The conversation data")


class ConversationsResponse(BaseModel):
    data: list[Conversation] = Field(description="List of conversations")


class MessagesResponse(BaseModel):
    data: list[Message] = Field(description="List of messages in the conversation")
