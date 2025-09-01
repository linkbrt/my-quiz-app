from uuid import UUID
from typing import List, Optional
from questions.domain.repositories import ISectionRepository, IQuizRepository, IQuestionRepository, IUserQuizAttemptRepository
from questions.domain.models.questions import Section, Quiz, Question, UserQuizAttempt, Answer

class QuizService:
    def __init__(
        self,
        section_repo: ISectionRepository,
        quiz_repo: IQuizRepository,
        question_repo: IQuestionRepository,
        answer_repo,
        attempt_repo: IUserQuizAttemptRepository,
    ):
        self.section_repo = section_repo
        self.quiz_repo = quiz_repo
        self.question_repo = question_repo
        self.attempt_repo = attempt_repo

    async def list_sections(self) -> List[Section]:
        return await self.section_repo.get_all()

    async def get_section(self, section_id: UUID) -> Optional[Section]:
        return await self.section_repo.get_by_id(section_id)
    
    async def create_section(self, section_data: dict) -> Section:
        return await self.section_repo.create(section_data)
    
    async def update_section(self, section_id: UUID, section_data: dict) -> Optional[Section]:
        return await self.section_repo.update(section_id, section_data)
    
    async def delete_section(self, section_id: UUID) -> bool:
        return await self.section_repo.delete(section_id)

    async def list_quizzes(self) -> List[Quiz]:
        return await self.quiz_repo.get_all()
    
    async def import_from_json(self, content: dict, section_id: str):
        return await self.section_repo.import_from_json(content, section_id)

    async def get_quiz(self, quiz_id: UUID) -> Optional[Quiz]:
        return await self.quiz_repo.get_by_id(quiz_id)
    
    async def list_quizzes_by_section(self, section_id: UUID) -> List[Quiz]:
        return await self.quiz_repo.get_by_section(section_id)
    
    async def create_quiz(self, quiz_data: dict) -> Quiz:
        return await self.quiz_repo.create(quiz_data)
    
    async def update_quiz(self, quiz_id: UUID, quiz_data: dict) -> Optional[Quiz]:
        return await self.quiz_repo.update(quiz_id, quiz_data)
    
    async def delete_quiz(self, quiz_id: UUID) -> bool:
        return await self.quiz_repo.delete(quiz_id)

    async def list_questions(self) -> List[Question]:
        return await self.question_repo.get_all()
    
    async def list_questions_by_quiz(self, quiz_id: UUID) -> List[Question]:
        return await self.question_repo.get_by_quiz(quiz_id)

    async def get_question(self, question_id: UUID) -> Optional[Question]:
        return await self.question_repo.get_by_id(question_id)
    
    async def create_question(self, question_data: dict) -> Question:
        return await self.question_repo.create(question_data)
    
    async def update_question(self, question_id: UUID, question_data: dict) -> Optional[Question]:
        return await self.question_repo.update(question_id, question_data)
    
    async def delete_question(self, question_id: UUID) -> bool:
        return await self.question_repo.delete(question_id)

    async def get_user_attempts(self, user_id: UUID) -> List[UserQuizAttempt]:
        return await self.attempt_repo.get_by_user(user_id)

    async def create_user_attempt(self, attempt_data: dict) -> UserQuizAttempt:
        return await self.attempt_repo.create(attempt_data)
    
    async def update_user_attempt(self, attempt_id: UUID, attempt_data: dict) -> Optional[UserQuizAttempt]:
        return await self.attempt_repo.update(attempt_id, attempt_data)
    
    async def delete_user_attempt(self, attempt_id: UUID) -> bool:
        return await self.attempt_repo.delete(attempt_id)
    
    async def get_answer(self, answer_id: UUID) -> Optional[Answer]:
        return await self.answer_repo.get_by_id(answer_id)
    
    async def create_answer(self, answer_data: dict) -> Quiz:
        return await self.answer_repo.create(answer_data)
    
    async def update_answer(self, answer_id: UUID, answer_data: dict) -> Optional[Quiz]:
        return await self.answer_repo.update(answer_id, answer_data)
    
    async def delete_quiz(self, quiz_id: UUID) -> bool:
        return await self.quiz_repo.delete(quiz_id)

