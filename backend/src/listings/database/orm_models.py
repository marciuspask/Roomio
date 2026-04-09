import uuid
from datetime import date

from sqlalchemy import JSON, Boolean, Date, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from common.database.base_models import Base, TenantAwareModel, TimestampModel


class ListingORM(Base, TimestampModel, TenantAwareModel):
    __tablename__ = "listings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()),
    )
    listing_type: Mapped[str] = mapped_column(String(20), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[str | None] = mapped_column(String(100), nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    utilities_incl: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false",
    )
    available_from: Mapped[date] = mapped_column(Date, nullable=False)
    allows_smoking: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false",
    )
    allows_pets: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false",
    )
    gender_pref: Mapped[str] = mapped_column(
        String(10), nullable=False, default="any", server_default="any",
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="draft", server_default="draft",
    )
    is_boosted: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false",
    )
    photos: Mapped[list[str]] = mapped_column(
        JSON, nullable=False, default=list, server_default="[]",
    )
    street_address: Mapped[str | None] = mapped_column(String(255), nullable=True)
