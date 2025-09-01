import uuid
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from questions.domain.models.questions import Section, Quiz, Question, UserQuizAttempt, Answer
from questions.domain.repositories import ISectionRepository, IQuizRepository, IQuestionRepository, IUserQuizAttemptRepository

class SectionRepository(ISectionRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Section]:
        result = await self.db.execute(select(Section))
        return result.scalars().all()

    async def get_by_id(self, section_id: uuid.UUID) -> Optional[Section]:
        result = await self.db.execute(select(Section).where(Section.id == section_id))
        return result.scalar_one_or_none()
    
    async def create(self, section_data: dict) -> Section:
        section = Section(**section_data)
        
        self.db.add(section)
        await self.db.commit()
        await self.db.refresh(section)
        return section
    
    async def update(self, section_id: uuid.UUID, section_data: dict) -> Optional[Section]:
        section = await self.get_by_id(section_id)
        if not section:
            return None
        for key, value in section_data.items():
            setattr(section, key, value)
        await self.db.add(section)
        await self.db.commit()
        await self.db.refresh(section)
        return section
    
    async def delete(self, section_id: uuid.UUID) -> bool:
        section = await self.db.get(Section, section_id)
        if not section:
            return False
        await self.db.delete(section)
        await self.db.commit()
        return True

class QuizRepository(IQuizRepository):
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

    async def create(self, quiz_data: dict) -> Quiz:
        quiz = Quiz(**quiz_data)
        self.db.add(quiz)
        await self.db.commit()
        await self.db.refresh(quiz)
        return quiz
    
    async def update(self, quiz_id: uuid.UUID, quiz_data: dict) -> Optional[Quiz]:
        quiz = await self.get_by_id(quiz_id)
        if not quiz:
            return None
        for key, value in quiz_data.items():
            setattr(quiz, key, value)
        await self.db.add(quiz)
        await self.db.commit()
        await self.db.refresh(quiz)
        return quiz
    
    async def delete(self, quiz_id: uuid.UUID) -> bool:
        quiz = await self.db.get(Quiz, quiz_id)
        if not quiz:
            return False
        await self.db.delete(quiz)
        await self.db.commit()
        return True

class QuestionRepository(IQuestionRepository):
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
    
    async def create(self, question_data: dict) -> Question:
        question = Question(**question_data)
        self.db.add(question)
        await self.db.commit()
        await self.db.refresh(question)
        return question
    
    async def update(self, question_id: uuid.UUID, question_data: dict) -> Optional[Question]:
        question = await self.get_by_id(question_id)
        if not question:
            return None
        for key, value in question_data.items():
            setattr(question, key, value)
        await self.db.add(question)
        await self.db.commit()
        await self.db.refresh(question)
        return question
    
    async def delete(self, question_id: uuid.UUID) -> bool:
        question = await self.db.get(Question, question_id)
        if not question:
            return False
        await self.db.delete(question)
        await self.db.commit()
        return True
    
class AnswerRepository():
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self) -> List[Answer]:
        result = await self.db.execute(select(Answer))
        return result.scalars().all()

    async def get_by_id(self, answer_id: uuid.UUID) -> Optional[Answer]:
        result = await self.db.execute(select(Answer).where(Answer.id == answer_id))
        return result.scalar_one_or_none()
    
    async def create(self, answer_data: dict) -> Answer:
        answer = Answer(**answer_data)
        self.db.add(answer)
        await self.db.commit()
        await self.db.refresh(answer)
        return answer
    
    async def update(self, question_id: uuid.UUID, question_data: dict) -> Optional[Question]:
        question = await self.get_by_id(question_id)
        if not question:
            return None
        for key, value in question_data.items():
            setattr(question, key, value)
        await self.db.add(question)
        await self.db.commit()
        await self.db.refresh(question)
        return question
    
    async def delete(self, question_id: uuid.UUID) -> bool:
        question = await self.db.get(Question, question_id)
        if not question:
            return False
        await self.db.delete(question)
        await self.db.commit()
        return True

class UserQuizAttemptRepository(IUserQuizAttemptRepository):
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
    
    async def update(self, attempt_id: uuid.UUID, attempt_data: dict) -> Optional[UserQuizAttempt]:
        attempt = await self.db.get(UserQuizAttempt, attempt_id)
        if not attempt:
            return None
        for key, value in attempt_data.items():
            setattr(attempt, key, value)
        await self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)
        return attempt
    
    async def delete(self, attempt_id: uuid.UUID) -> bool:
        attempt = await self.db.get(UserQuizAttempt, attempt_id)
        if not attempt:
            return False
        await self.db.delete(attempt)
        await self.db.commit()
        return True
