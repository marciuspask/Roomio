import uuid

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from common.database.base_models import Base, TenantAwareModel, TimestampModel


class SettingsORM(Base, TimestampModel, TenantAwareModel):
    __tablename__ = "settings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
    )
    theme: Mapped[str] = mapped_column(
        String(20), nullable=False, default="system", server_default="system",
    )
    language: Mapped[str] = mapped_column(
        String(10), nullable=False, default="en", server_default="en",
    )
    notifications_enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true",
    )
    email_digest: Mapped[str] = mapped_column(
        String(20), nullable=False, default="weekly", server_default="weekly",
    )
    timezone: Mapped[str] = mapped_column(
        String(50), nullable=False, default="UTC", server_default="UTC",
    )
