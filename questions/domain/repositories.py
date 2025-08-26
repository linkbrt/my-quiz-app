from abc import ABC, abstractmethod
from uuid import UUID
from typing import List, Optional, Any

class ISectionRepository(ABC):
    @abstractmethod
    async def get_all(self) -> List[Any]:
        pass

    @abstractmethod
    async def get_by_id(self, section_id: UUID) -> Optional[Any]:
        pass

class IQuizRepository(ABC):
    @abstractmethod
    async def get_all(self) -> List[Any]:
        pass

    @abstractmethod
    async def get_by_id(self, quiz_id: UUID) -> Optional[Any]:
        pass

    @abstractmethod
    async def get_by_section(self, section_id: UUID) -> List[Any]:
        pass

class IQuestionRepository(ABC):
    @abstractmethod
    async def get_all(self) -> List[Any]:
        pass

    @abstractmethod
    async def get_by_id(self, question_id: UUID) -> Optional[Any]:
        pass

    @abstractmethod
    async def get_by_quiz(self, quiz_id: UUID) -> List[Any]:
        pass

class IUserQuizAttemptRepository(ABC):
    @abstractmethod
    async def get_by_user(self, user_id: UUID) -> List[Any]:
        pass

    @abstractmethod
    async def create(self, attempt_data: dict) -> Any:
        pass
