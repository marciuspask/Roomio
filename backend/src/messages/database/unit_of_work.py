from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import get_anonymous_context
from common.database.unit_of_work import UnitOfWork
from listings.repositories import ListingsRepository
from messages.database.participant_repository import ParticipantRepository
from messages.repositories import ConversationRepository, MessageRepository
from models import TenantContext
from profile.repositories import ProfileRepository


class MessagesUnitOfWork(UnitOfWork):
    def __init__(self, session: AsyncSession, tenant_context: TenantContext) -> None:
        super().__init__(session)
        self.conversations = ConversationRepository(session)
        self.messages = MessageRepository(session)
        self.participants = ParticipantRepository(session, tenant_context)
        # Cross-module access for enrichment (same session, anonymous read-only)
        _anon = get_anonymous_context()
        self.profiles = ProfileRepository(session, _anon)
        self.listings = ListingsRepository(session, _anon)
