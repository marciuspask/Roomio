from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field


class AuthMethod(StrEnum):
    BEARER = "bearer"


class TenantType(StrEnum):
    USER = "user"


class UserRole(StrEnum):
    ADMIN = "admin"
    USER = "user"


class TenantContext(BaseModel):
    """The authenticated user's identity — flows through the entire request.

    Extracted from the JWT token by auth dependencies.
    Frozen (immutable) so it can't be accidentally modified mid-request.
    """

    model_config = ConfigDict(frozen=True)

    tenant_id: str = Field(description="Tenant identifier for data isolation")
    tenant_type: TenantType = Field(
        default=TenantType.USER,
        description="Type of tenant (user, future: organization)",
    )
    user_id: str = Field(description="Unique user identifier")
    username: str = Field(description="Display name")
    email: str | None = Field(default=None, description="Email address")
    role: UserRole = Field(description="User role (admin or user)")
    auth_method: AuthMethod = Field(description="How the user authenticated")
    is_admin: bool = Field(description="Whether user has admin privileges")
