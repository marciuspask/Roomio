from fastapi import APIRouter, status

from di import ListingsServiceDep, PublicListingsServiceDep
from listings.models import ListingCreate, ListingResponse, ListingsResponse, ListingUpdate

router = APIRouter(prefix="/api/v1/listings", tags=["listings"])


@router.get("/", response_model=ListingsResponse)
async def get_all_listings(service: PublicListingsServiceDep) -> ListingsResponse:
    listings = await service.get_all_listings()
    return ListingsResponse(data=listings)


@router.get("/my", response_model=ListingsResponse)
async def get_my_listings(service: ListingsServiceDep) -> ListingsResponse:
    listings = await service.get_my_listings()
    return ListingsResponse(data=listings)


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str, service: PublicListingsServiceDep) -> ListingResponse:
    listing = await service.get_listing(listing_id)
    return ListingResponse(data=listing)


@router.post("/", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
async def create_listing(
    body: ListingCreate,
    service: ListingsServiceDep,
) -> ListingResponse:
    listing = await service.create_listing(body)
    return ListingResponse(data=listing)


@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: str,
    body: ListingUpdate,
    service: ListingsServiceDep,
) -> ListingResponse:
    listing = await service.update_listing(listing_id, body)
    return ListingResponse(data=listing)


@router.delete("/{listing_id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
async def delete_listing(listing_id: str, service: ListingsServiceDep) -> None:
    await service.delete_listing(listing_id)
