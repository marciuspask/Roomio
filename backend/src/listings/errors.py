from errors.base import BaseAppError, ErrorData


class ListingError(BaseAppError):
    @classmethod
    def not_found(cls, listing_id: str) -> "ListingError":
        return cls(ErrorData(
            detail=f"Listing not found: {listing_id}",
            error_code="LISTING_NOT_FOUND",
            status_code=404,
            context={"listing_id": listing_id},
        ))

    @classmethod
    def not_owner(cls, listing_id: str) -> "ListingError":
        return cls(ErrorData(
            detail=f"You do not own listing: {listing_id}",
            error_code="LISTING_NOT_OWNER",
            status_code=403,
            context={"listing_id": listing_id},
        ))
