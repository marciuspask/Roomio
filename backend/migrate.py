#!/usr/bin/env python3
"""
One-shot migration script for the Roomio Neon production database.

Creates all tables and applies schema evolution:
  - Adds columns introduced after the initial deploy
  - Backfills conversation_participants from legacy participant_ids (JSONB)
  - Drops columns that were removed

Run from backend/:
    uv run python migrate.py
"""

import asyncio
import sys
from pathlib import Path

# Make all app modules importable without installing the package
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Import every ORM module so they register with Base.metadata before create_all
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

import listings.database.orm_models  # noqa: F401
import messages.database.orm_models  # noqa: F401
import moderation.database.orm_models  # noqa: F401
import phone_verification.database.orm_models  # noqa: F401
import profile.database.orm_models  # noqa: F401
import saved.database.orm_models  # noqa: F401
import settings.database.orm_models  # noqa: F401
from common.database.base_models import Base

DATABASE_URL = (
    "postgresql+asyncpg://neondb_owner:npg_vXGmD39VKnWc"
    "@ep-round-wind-a258dmwx.eu-central-1.aws.neon.tech/neondb"
)


async def column_exists(conn, table: str, column: str) -> bool:
    result = await conn.execute(
        text(
            "SELECT EXISTS ("
            "  SELECT 1 FROM information_schema.columns"
            "  WHERE table_name = :t AND column_name = :c"
            ")"
        ),
        {"t": table, "c": column},
    )
    return bool(result.scalar())


async def main() -> None:
    engine = create_async_engine(DATABASE_URL, echo=False)

    async with engine.begin() as conn:
        # ── 1. Create all tables that don't exist yet ─────────────────────
        print("Step 1 — creating missing tables...")
        await conn.run_sync(Base.metadata.create_all)
        print("  ✓ done\n")

        # ── 2. Add columns introduced after initial deploy ────────────────
        print("Step 2 — adding missing columns...")

        if not await column_exists(conn, "listings", "street_address"):
            await conn.execute(text("ALTER TABLE listings ADD COLUMN street_address VARCHAR(255)"))
            print("  ✓ listings.street_address added")
        else:
            print("  · listings.street_address already present")

        if not await column_exists(conn, "conversations", "status"):
            await conn.execute(
                text(
                    "ALTER TABLE conversations "
                    "ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'"
                )
            )
            print("  ✓ conversations.status added")
        else:
            print("  · conversations.status already present")

        if not await column_exists(conn, "listings", "is_boosted_until"):
            await conn.execute(text("ALTER TABLE listings ADD COLUMN is_boosted_until TIMESTAMPTZ"))
            print("  ✓ listings.is_boosted_until added")
        else:
            print("  · listings.is_boosted_until already present")

        print()

        # ── 3. Backfill conversation_participants from legacy JSONB column ─
        print("Step 3 — checking for legacy participant_ids...")
        has_legacy = await column_exists(conn, "conversations", "participant_ids")

        if has_legacy:
            print("  Found participant_ids column — backfilling join table...")
            result = await conn.execute(
                text("""
                INSERT INTO conversation_participants
                    (id, conversation_id, tenant_id, tenant_type,
                     role, created_at, updated_at)
                SELECT
                    gen_random_uuid()::text,
                    c.id,
                    elem,
                    'user',
                    CASE WHEN elem = l.tenant_id THEN 'owner' ELSE 'initiator' END,
                    NOW(),
                    NOW()
                FROM conversations c
                CROSS JOIN LATERAL jsonb_array_elements_text(c.participant_ids) AS elem
                LEFT JOIN listings l ON l.id = c.listing_id
                ON CONFLICT (conversation_id, tenant_id) DO NOTHING
            """)
            )
            print(f"  ✓ {result.rowcount} participant rows inserted")
            await conn.execute(text("ALTER TABLE conversations DROP COLUMN participant_ids"))
            print("  ✓ participant_ids column dropped\n")
        else:
            print("  · No legacy column — backfill not needed\n")

        # ── 4. Drop columns removed after initial deploy ──────────────────
        print("Step 4 — removing obsolete columns...")

        if await column_exists(conn, "messages", "is_read"):
            await conn.execute(text("ALTER TABLE messages DROP COLUMN is_read"))
            print("  ✓ messages.is_read dropped")
        else:
            print("  · messages.is_read already gone")

    await engine.dispose()
    print("\n✓ All migrations complete.")


if __name__ == "__main__":
    asyncio.run(main())
