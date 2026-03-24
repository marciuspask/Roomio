from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any, TypeVar

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

T = TypeVar("T", bound="UnitOfWork")


class UnitOfWork:
    """Transaction boundary — wraps multiple repository operations.

    Repositories flush() but never commit(). UoW commits on success,
    rolls back on exception. This ensures atomic operations.

    Usage:
        class SettingsUnitOfWork(UnitOfWork):
            def __init__(self, session, tenant_context):
                super().__init__(session)
                self.settings = SettingsRepository(session, tenant_context)

        async with uow_factory.create(SettingsUnitOfWork, tenant_context) as uow:
            settings = await uow.settings.create_settings(data)
            # auto-commits here if no exception
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def __aenter__(self) -> "UnitOfWork":
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: Any,
    ) -> None:
        if exc_type is not None:
            await self.rollback()
        else:
            await self.commit()

    async def commit(self) -> None:
        await self.session.commit()

    async def rollback(self) -> None:
        await self.session.rollback()

    async def flush(self) -> None:
        await self.session.flush()


class UnitOfWorkFactory:
    """Creates UoW instances with managed sessions.

    Usage:
        factory = UnitOfWorkFactory(session_maker)
        async with factory.create(SettingsUnitOfWork, tenant_context) as uow:
            await uow.settings.create_settings(data)
    """

    def __init__(self, session_maker: async_sessionmaker[AsyncSession]) -> None:
        self._session_maker = session_maker

    @asynccontextmanager
    async def create(self, uow_class: type[T], *args: Any) -> AsyncGenerator[T, None]:
        """Create a UoW with a fresh session.

        Extra *args are forwarded to uow_class.__init__ after session.
        """
        session = self._session_maker()
        try:
            uow = uow_class(session, *args)
            async with uow:
                yield uow  # type: ignore[misc]
        finally:
            await session.close()
