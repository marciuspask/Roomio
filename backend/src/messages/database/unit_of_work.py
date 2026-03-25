from sqlalchemy.ext.asyncio import AsyncSession

from common.database.unit_of_work import UnitOfWork
from messages.repositories import ConversationRepository, MessageRepository


class MessagesUnitOfWork(UnitOfWork):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session)
        self.conversations = ConversationRepository(session)
        self.messages = MessageRepository(session)
