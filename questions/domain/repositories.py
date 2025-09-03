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

    @abstractmethod
    async def create(self, section_data: dict) -> Any:
        pass

    @abstractmethod
    def update(self, section_id: UUID, section_data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, section_id: UUID) -> bool:
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

    @abstractmethod
    async def create(self, quiz_data: dict) -> Any:
        pass

    @abstractmethod
    def update(self, quiz_id: UUID, quiz_data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, quiz_id: UUID) -> bool:
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

    @abstractmethod
    async def create(self, question_data: dict) -> Any:
        pass

    @abstractmethod
    def update(self, question_id: UUID, question_data: dict) -> Optional[Any]:
        pass

    @abstractmethod
    def delete(self, question_id: UUID) -> bool:
        pass
