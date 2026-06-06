import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from common.database.base_models import Base, TenantAwareModel, TimestampModel


class ConversationORM(Base, TimestampModel):
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
    )
    listing_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="active", server_default="active",
    )


class MessageORM(Base, TimestampModel):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
    )
    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)


class ConversationParticipantORM(Base, TimestampModel, TenantAwareModel):
    __tablename__ = "conversation_participants"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
    )
    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="initiator")
    last_read_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None,
    )
    is_muted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false",
    )
    is_archived: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false",
    )

    __table_args__ = (
        UniqueConstraint("conversation_id", "tenant_id", name="uq_conv_participant"),
    )
