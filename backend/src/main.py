from contextlib import asynccontextmanager

import structlog
from clerk_backend_api import Clerk
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRoute
from pydantic import ValidationError

import listings.database.orm_models  # noqa: F401 — registers ListingORM with Base.metadata
import profile.database.orm_models  # noqa: F401 — registers ProfileORM with Base.metadata
import settings.database.orm_models  # noqa: F401 — registers SettingsORM with Base.metadata
from auth.dependencies import TenantResolver
from common.database.connection import DatabaseConnection
from config import Settings
from errors.base import BaseAppError
from errors.handlers import (
    base_app_error_handler,
    generic_exception_handler,
    pydantic_validation_error_handler,
    request_validation_error_handler,
)
from listings.router import router as listings_router
from logging_config import configure_logging
from profile.router import router as profile_router
from profile.router import users_router
from routes.health import router as health_router
from routes.me import router as me_router
from settings.router import router as settings_router

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    config = Settings()  # type: ignore[call-arg]  # pydantic-settings reads from .env
    app.state.config = config

    configure_logging(debug=config.debug)

    clerk_client = Clerk(bearer_auth=config.clerk_secret_key)
    app.state.tenant_resolver = TenantResolver(clerk_client)
    logger.info("clerk_initialized")

    session_maker = await DatabaseConnection.initialize(
        database_url=config.database_url,
        echo_sql=config.debug,
    )
    app.state.session_maker = session_maker

    logger.info(
        "app_starting",
        name=config.app_name,
        version=config.app_version,
        host=config.host,
        port=config.port,
        debug=config.debug,
    )

    for route in app.routes:
        if isinstance(route, APIRoute):
            logger.info(
                "route_registered",
                path=route.path,
                methods=sorted(route.methods),
            )

    yield

    await DatabaseConnection.close()
    logger.info("app_shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Roomio API",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://localhost:8082", "http://localhost:8083"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_exception_handler(BaseAppError, base_app_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(ValidationError, pydantic_validation_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, request_validation_error_handler)  # type: ignore[arg-type]
    app.add_exception_handler(Exception, generic_exception_handler)

    app.include_router(health_router)
    app.include_router(me_router)
    app.include_router(profile_router)
    app.include_router(users_router)
    app.include_router(settings_router)
    app.include_router(listings_router)

    return app


app = create_app()
