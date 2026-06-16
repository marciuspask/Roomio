from collections.abc import Sequence
from typing import Generic, TypeVar

from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from common.database.base_models import Base
from models import TenantContext

TOrm = TypeVar("TOrm", bound=Base)
TModel = TypeVar("TModel", bound=BaseModel)


class OrmConverter(Generic[TOrm, TModel]):
    """Typed bridge for Pydantic ↔ ORM conversion.

    Replaces all **kwargs patterns in repositories.
    """

    def __init__(self, orm_class: type[TOrm], model_class: type[TModel]) -> None:
        self._orm_class = orm_class
        self._model_class = model_class

    def to_orm(
        self,
        data: BaseModel,
        *,
        extra_fields: dict[str, object] | None = None,
    ) -> TOrm:
        """Pydantic model → new ORM entity."""
        fields = data.model_dump()
        if extra_fields:
            fields.update(extra_fields)
        return self._orm_class(**fields)

    def apply_update(self, entity: TOrm, update: BaseModel) -> None:
        """Apply Pydantic update model to existing ORM entity.

        Only explicitly set fields are applied (exclude_unset=True).
        """
        for key, value in update.model_dump(exclude_unset=True).items():
            setattr(entity, key, value)

    def to_model(self, entity: TOrm) -> TModel:
        """ORM entity → Pydantic model."""
        return self._model_class.model_validate(entity, from_attributes=True)

    def to_model_list(self, entities: Sequence[TOrm]) -> list[TModel]:
        """Convert a sequence of ORM entities to Pydantic models."""
        return [self.to_model(e) for e in entities]


class BaseRepository(Generic[TOrm, TModel]):
    """Flush-only repository with dual-type binding.

    Public API works with Pydantic models (TModel).
    ORM (TOrm) is an internal implementation detail.

    RULES:
    1. No **kwargs in public methods
    2. All inputs are typed Pydantic models
    3. flush() only — never commit() (that's UoW's job)
    4. Protected _create/_update must be wrapped with typed methods in subclasses

    Usage:
        class SettingsRepository(BaseRepository[SettingsORM, Settings]):
            def __init__(self, session, tenant_context):
                super().__init__(session, SettingsORM, Settings)

            async def create_settings(self, data: SettingsUpdate) -> Settings:
                return await self._create(data)
    """

    def __init__(
        self,
        session: AsyncSession,
        orm_class: type[TOrm],
        model_class: type[TModel],
    ) -> None:
        self.session = session
        self.orm_class = orm_class
        self.model_class = model_class
        self._converter = OrmConverter(orm_class, model_class)

    def to_model(self, entity: TOrm) -> TModel:
        return self._converter.to_model(entity)

    def to_model_list(self, entities: Sequence[TOrm]) -> list[TModel]:
        return self._converter.to_model_list(entities)

    # -- Protected mutations (subclasses wrap with typed signatures) ----------
    #
    # NOTE: _create and _update accept BaseModel (not TModel) intentionally.
    # The input model is often DIFFERENT from the output model — e.g., you
    # receive SettingsUpdate (partial) but return Settings (full entity).
    # Using TModel here would force input and output to be the same type.
    # The type safety lives in the concrete repository's public wrapper:
    #
    #   async def create_settings(self, data: SettingsUpdate) -> Settings:
    #       return await self._create(data)
    #
    # The public method is fully typed. The protected method is plumbing.

    async def _create(
        self,
        data: BaseModel,
        *,
        extra_fields: dict[str, object] | None = None,
    ) -> TModel:
        """Create entity. Flush only — no commit."""
        entity = self._converter.to_orm(data, extra_fields=extra_fields)
        self.session.add(entity)
        await self.session.flush()
        await self.session.refresh(entity)
        return self.to_model(entity)

    async def _update(
        self,
        entity_id: str,
        update: BaseModel,
    ) -> TModel | None:
        """Update entity by ID. Flush only — no commit."""
        entity = await self.session.get(self.orm_class, entity_id)
        if entity is None:
            return None
        self._converter.apply_update(entity, update)
        await self.session.flush()
        await self.session.refresh(entity)
        return self.to_model(entity)

    # -- Public reads ---------------------------------------------------------

    async def get_by_id(self, entity_id: str) -> TModel | None:
        entity = await self.session.get(self.orm_class, entity_id)
        if entity is None:
            return None
        return self.to_model(entity)

    async def get_all(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[TModel]:
        stmt = select(self.orm_class).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return self.to_model_list(list(result.scalars().all()))

    async def delete(self, entity_id: str, *, soft: bool = True) -> bool:
        entity = await self.session.get(self.orm_class, entity_id)
        if entity is None:
            return False
        if soft and hasattr(entity, "is_deleted"):
            entity.is_deleted = True  # type: ignore[attr-defined]
        else:
            await self.session.delete(entity)
        await self.session.flush()
        return True

    async def count(self) -> int:
        stmt = select(func.count()).select_from(self.orm_class)
        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def exists(self) -> bool:
        return await self.count() > 0


class TenantRepository(BaseRepository[TOrm, TModel]):
    """Repository with automatic tenant_id scoping.

    ALL queries are filtered by tenant_id. No unfiltered methods exist.
    Safe by default — you cannot accidentally read another tenant's data.

    Usage:
        class SettingsRepository(TenantRepository[SettingsORM, Settings]):
            def __init__(self, session, tenant_context):
                super().__init__(session, SettingsORM, Settings, tenant_context)
    """

    def __init__(
        self,
        session: AsyncSession,
        orm_class: type[TOrm],
        model_class: type[TModel],
        tenant_context: TenantContext,
    ) -> None:
        super().__init__(session, orm_class, model_class)
        self._tenant_context = tenant_context
        self._tenant_id = tenant_context.tenant_id
        self._tenant_type = tenant_context.tenant_type.value

    # -- Protected mutations: auto-inject tenant_id ---------------------------

    async def _create(
        self,
        data: BaseModel,
        *,
        extra_fields: dict[str, object] | None = None,
    ) -> TModel:
        tenant_fields: dict[str, object] = {
            "tenant_id": self._tenant_id,
            "tenant_type": self._tenant_type,
        }
        if extra_fields:
            tenant_fields.update(extra_fields)
        return await super()._create(data, extra_fields=tenant_fields)

    async def _update(
        self,
        entity_id: str,
        update: BaseModel,
    ) -> TModel | None:
        entity = await self.session.get(self.orm_class, entity_id)
        if entity is None:
            return None
        if getattr(entity, "tenant_id", None) != self._tenant_id:
            return None  # Not this tenant's data
        self._converter.apply_update(entity, update)
        await self.session.flush()
        await self.session.refresh(entity)
        return self.to_model(entity)

    # -- Public overrides: all scoped to tenant -------------------------------

    async def get_by_id(self, entity_id: str) -> TModel | None:
        entity = await self.session.get(self.orm_class, entity_id)
        if entity is None:
            return None
        if getattr(entity, "tenant_id", None) != self._tenant_id:
            return None  # Not this tenant's data
        return self.to_model(entity)

    async def get_all(
        self,
        *,
        limit: int = 100,
        offset: int = 0,
    ) -> list[TModel]:
        stmt = (
            select(self.orm_class)
            .where(self.orm_class.tenant_id == self._tenant_id)  # type: ignore[attr-defined]
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return self.to_model_list(list(result.scalars().all()))

    async def delete(self, entity_id: str, *, soft: bool = True) -> bool:
        entity = await self.session.get(self.orm_class, entity_id)
        if entity is None:
            return False
        if getattr(entity, "tenant_id", None) != self._tenant_id:
            return False  # Not this tenant's data
        if soft and hasattr(entity, "is_deleted"):
            entity.is_deleted = True  # type: ignore[attr-defined]
        else:
            await self.session.delete(entity)
        await self.session.flush()
        return True

    async def count(self) -> int:
        stmt = (
            select(func.count())
            .select_from(self.orm_class)
            .where(self.orm_class.tenant_id == self._tenant_id)  # type: ignore[attr-defined]
        )
        result = await self.session.execute(stmt)
        return result.scalar_one()
