from errors.base import BaseAppError, ErrorData


class SavedListingError(BaseAppError):
    @classmethod
    def listing_not_found(cls, listing_id: str) -> "SavedListingError":
        return cls(
            ErrorData(
                detail=f"Listing not found: {listing_id}",
                error_code="LISTING_NOT_FOUND",
                status_code=404,
                context={"listing_id": listing_id},
            )
        )
