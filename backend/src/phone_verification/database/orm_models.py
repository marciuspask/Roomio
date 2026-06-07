import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from common.database.base_models import Base, TimestampModel


class PhoneVerificationORM(Base, TimestampModel):
    __tablename__ = "phone_verifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
    )
    tenant_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    phone_number: Mapped[str] = mapped_column(String(20), nullable=False)
    code: Mapped[str] = mapped_column(String(6), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_used: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false",
    )
