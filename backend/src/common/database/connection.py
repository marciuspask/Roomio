import structlog
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from common.database.base_models import Base

logger = structlog.get_logger(__name__)

_engine: AsyncEngine | None = None
_session_maker: async_sessionmaker[AsyncSession] | None = None


class DatabaseConnection:
    """Manages the global async engine and session factory.

    Call initialize() once at app startup (in lifespan).
    Call close() at shutdown.
    """

    @staticmethod
    async def initialize(
        database_url: str,
        echo_sql: bool = False,
    ) -> async_sessionmaker[AsyncSession]:
        global _engine, _session_maker

        if _session_maker is not None:
            return _session_maker

        _engine = create_async_engine(
            database_url,
            echo=echo_sql,
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
        )

        _session_maker = async_sessionmaker(
            bind=_engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        # Auto-create all tables from ORM models
        async with _engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        logger.info("database_initialized")
        return _session_maker

    @staticmethod
    def get_session_maker() -> async_sessionmaker[AsyncSession]:
        if _session_maker is None:
            raise RuntimeError("Database not initialized. Call initialize() first.")
        return _session_maker

    @staticmethod
    async def close() -> None:
        global _engine, _session_maker
        if _engine is not None:
            await _engine.dispose()
            _engine = None
            _session_maker = None
            logger.info("database_connection_closed")
