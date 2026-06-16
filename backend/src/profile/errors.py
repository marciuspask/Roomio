from errors.base import BaseAppError, ErrorData


class ProfileError(BaseAppError):
    @classmethod
    def not_found(cls, tenant_id: str) -> "ProfileError":
        return cls(
            ErrorData(
                detail=f"Profile not found for tenant: {tenant_id}",
                error_code="PROFILE_NOT_FOUND",
                status_code=404,
                context={"tenant_id": tenant_id},
            )
        )

    @classmethod
    def underage(cls) -> "ProfileError":
        return cls(
            ErrorData(
                detail="You must be 18 or older to use Roomio",
                error_code="PROFILE_UNDERAGE",
                status_code=422,
            )
        )

    @classmethod
    def update_failed(cls, tenant_id: str) -> "ProfileError":
        return cls(
            ErrorData(
                detail=f"Failed to update profile for tenant: {tenant_id}",
                error_code="PROFILE_UPDATE_FAILED",
                status_code=500,
                context={"tenant_id": tenant_id},
            )
        )
