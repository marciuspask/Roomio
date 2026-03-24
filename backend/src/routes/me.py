from fastapi import APIRouter
from pydantic import BaseModel, Field

from di import AdminDep, TenantDep
from models import AuthMethod, TenantType, UserRole

router = APIRouter()


class MeData(BaseModel):
    tenant_id: str = Field(description="Tenant identifier for data isolation")
    tenant_type: TenantType = Field(description="Type of tenant (user, future: organization)")
    user_id: str = Field(description="Unique user identifier")
    username: str = Field(description="Display name")
    email: str | None = Field(description="Email address")
    role: UserRole = Field(description="User role (admin or user)")
    auth_method: AuthMethod = Field(description="How the user authenticated")
    is_admin: bool = Field(description="Whether user has admin privileges")


class MeResponse(BaseModel):
    data: MeData = Field(description="Authenticated user context")


class AdminTestData(BaseModel):
    message: str = Field(description="Confirmation of admin access")
    user_id: str = Field(description="Authenticated admin user ID")


class AdminTestResponse(BaseModel):
    data: AdminTestData = Field(description="Admin test result")


@router.get("/api/v1/admin/test", response_model=AdminTestResponse, tags=["admin"])
async def admin_test(tenant: AdminDep) -> AdminTestResponse:
    return AdminTestResponse(
        data=AdminTestData(
            message="Admin access confirmed",
            user_id=tenant.user_id,
        ),
    )


@router.get("/api/v1/me", response_model=MeResponse, tags=["auth"])
async def me(tenant: TenantDep) -> MeResponse:
    return MeResponse(
        data=MeData(
            tenant_id=tenant.tenant_id,
            tenant_type=tenant.tenant_type,
            user_id=tenant.user_id,
            username=tenant.username,
            email=tenant.email,
            role=tenant.role,
            auth_method=tenant.auth_method,
            is_admin=tenant.is_admin,
        ),
    )
