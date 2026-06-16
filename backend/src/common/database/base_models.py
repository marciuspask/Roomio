from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all ORM models. Every table inherits from this."""


class TimestampModel:
    """Mixin — adds created_at and updated_at to any ORM model.

    Usage:
        class MyORM(Base, TimestampModel):
            __tablename__ = "my_table"
            ...
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class TenantAwareModel:
    """Mixin — adds tenant_id + tenant_type for multi-tenant isolation.

    Usage:
        class MyORM(Base, TimestampModel, TenantAwareModel):
            __tablename__ = "my_table"
            ...

    The tenant_id is indexed for fast filtering.
    TenantRepository auto-injects these on create and filters on read.
    """

    tenant_id: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    tenant_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="user",
        server_default="user",
    )


class SoftDeleteModel:
    """Mixin — adds soft delete support (is_deleted + deleted_at).

    Instead of removing rows, mark them as deleted.
    """

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        server_default="false",
        nullable=False,
    )
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )

    def soft_delete(self) -> None:
        self.is_deleted = True
        self.deleted_at = datetime.now(UTC)

    def restore(self) -> None:
        self.is_deleted = False
        self.deleted_at = None
