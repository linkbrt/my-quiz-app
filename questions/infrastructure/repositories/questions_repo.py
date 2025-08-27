import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from domain.models.questions import Section, Quiz, Question, UserQuizAttempt

class SectionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Section]:
        result = await self.db.execute(select(Section))
        return result.scalars().all()

    async def get_by_id(self, section_id: uuid.UUID) -> Optional[Section]:
        result = await self.db.execute(select(Section).where(Section.id == section_id))
        return result.scalar_one_or_none()

class QuizRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Quiz]:
        result = await self.db.execute(select(Quiz))
        return result.scalars().all()

    async def get_by_id(self, quiz_id: uuid.UUID) -> Optional[Quiz]:
        result = await self.db.execute(select(Quiz).where(Quiz.id == quiz_id))
        return result.scalar_one_or_none()

    async def get_by_section(self, section_id: uuid.UUID) -> List[Quiz]:
        result = await self.db.execute(select(Quiz).where(Quiz.section_id == section_id))
        return result.scalars().all()

class QuestionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Question]:
        result = await self.db.execute(select(Question))
        return result.scalars().all()

    async def get_by_id(self, question_id: uuid.UUID) -> Optional[Question]:
        result = await self.db.execute(select(Question).where(Question.id == question_id))
        return result.scalar_one_or_none()

    async def get_by_quiz(self, quiz_id: uuid.UUID) -> List[Question]:
        result = await self.db.execute(select(Question).where(Question.quiz_id == quiz_id))
        return result.scalars().all()

class UserQuizAttemptRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user(self, user_id: uuid.UUID) -> List[UserQuizAttempt]:
        result = await self.db.execute(select(UserQuizAttempt).where(UserQuizAttempt.user_id == user_id))
        return result.scalars().all()

    async def create(self, attempt_data: dict) -> UserQuizAttempt:
        attempt = UserQuizAttempt(**attempt_data)
        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)
        return attempt