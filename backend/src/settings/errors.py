from errors.base import BaseAppError, ErrorData


class SettingsError(BaseAppError):
    @classmethod
    def not_found(cls, tenant_id: str) -> "SettingsError":
        return cls(
            ErrorData(
                detail=f"Settings not found for tenant: {tenant_id}",
                error_code="SETTINGS_NOT_FOUND",
                status_code=404,
                context={"tenant_id": tenant_id},
            )
        )

    @classmethod
    def update_failed(cls, reason: str) -> "SettingsError":
        return cls(
            ErrorData(
                detail=f"Settings update failed: {reason}",
                error_code="SETTINGS_UPDATE_FAILED",
                status_code=500,
                context={"reason": reason},
            )
        )

    @classmethod
    def already_exists(cls, tenant_id: str) -> "SettingsError":
        return cls(
            ErrorData(
                detail=f"Settings already exist for tenant: {tenant_id}",
                error_code="SETTINGS_ALREADY_EXISTS",
                status_code=409,
                context={"tenant_id": tenant_id},
            )
        )
