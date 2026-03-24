from fastapi import APIRouter, Request
from pydantic import BaseModel, Field

router = APIRouter()


class HealthData(BaseModel):
    status: str = Field(description="Current health status of the API")
    version: str = Field(description="Running application version")
    environment: str = Field(description="Host the server is bound to")
    debug: bool = Field(description="Whether debug mode is enabled")


class HealthResponse(BaseModel):
    data: HealthData = Field(description="Health check data")


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    config = request.app.state.config
    return HealthResponse(
        data=HealthData(
            status="ok",
            version=config.app_version,
            environment=config.host,
            debug=config.debug,
        ),
    )
