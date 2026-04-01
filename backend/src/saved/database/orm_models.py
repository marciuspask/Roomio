import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from common.database.base_models import Base, TenantAwareModel


class SavedListingORM(Base, TenantAwareModel):
    __tablename__ = "saved_listings"
    __table_args__ = (
        UniqueConstraint("tenant_id", "listing_id", name="uq_saved_tenant_listing"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
    )
    listing_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
