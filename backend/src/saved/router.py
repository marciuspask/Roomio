from fastapi import APIRouter, status

from di import SavedListingsServiceDep
from saved.models import SavedListingsResponse

router = APIRouter(prefix="/api/v1/saved", tags=["saved"])


@router.get("/", response_model=SavedListingsResponse)
async def get_saved_listings(service: SavedListingsServiceDep) -> SavedListingsResponse:
    ids = await service.get_saved_ids()
    return SavedListingsResponse(data=ids)


@router.post("/{listing_id}", response_model=None, status_code=status.HTTP_201_CREATED)
async def save_listing(listing_id: str, service: SavedListingsServiceDep) -> None:
    await service.save_listing(listing_id)


@router.delete("/{listing_id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
async def unsave_listing(listing_id: str, service: SavedListingsServiceDep) -> None:
    await service.unsave_listing(listing_id)
