import httpx
import structlog
from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

logger = structlog.get_logger(__name__)

router = APIRouter(tags=["geocode"])


class GeocodeResult(BaseModel):
    lat: float
    lng: float


@router.get("/api/v1/geocode", response_model=GeocodeResult)
async def geocode(request: Request, address: str = Query(..., min_length=1)) -> GeocodeResult:
    api_key: str = request.app.state.config.google_maps_api_key
    if not api_key:
        raise HTTPException(status_code=503, detail="Geocoding not configured")

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/geocode/json",
                params={"address": address, "key": api_key},
            )
        data = resp.json()
    except Exception as exc:
        logger.warning("geocode_request_failed", address=address, error=str(exc))
        raise HTTPException(status_code=503, detail="Geocoding service unavailable") from exc

    if data.get("status") != "OK" or not data.get("results"):
        logger.info("geocode_no_results", address=address, status=data.get("status"))
        raise HTTPException(status_code=404, detail="Address not found")

    loc = data["results"][0]["geometry"]["location"]
    return GeocodeResult(lat=loc["lat"], lng=loc["lng"])
