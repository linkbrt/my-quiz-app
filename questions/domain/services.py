from uuid import UUID
from typing import List, Optional
from questions.domain.repositories import ISectionRepository, IQuizRepository, IQuestionRepository, IUserQuizAttemptRepository
from questions.domain.models.questions import Section, Quiz, Question, UserQuizAttempt

class QuizService:
    def __init__(
        self,
        section_repo: ISectionRepository,
        quiz_repo: IQuizRepository,
        question_repo: IQuestionRepository,
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

    async def list_quizzes(self) -> List[Quiz]:
        return await self.quiz_repo.get_all()

    async def get_quiz(self, quiz_id: UUID) -> Optional[Quiz]:
        return await self.quiz_repo.get_by_id(quiz_id)

    async def list_quizzes_by_section(self, section_id: UUID) -> List[Quiz]:
        return await self.quiz_repo.get_by_section(section_id)

    async def list_questions(self) -> List[Question]:
        return await self.question_repo.get_all()

    async def get_question(self, question_id: UUID) -> Optional[Question]:
        return await self.question_repo.get_by_id(question_id)

    async def list_questions_by_quiz(self, quiz_id: UUID) -> List[Question]:
        return await self.question_repo.get_by_quiz(quiz_id)

    async def get_user_attempts(self, user_id: UUID) -> List[UserQuizAttempt]:
        return await self.attempt_repo.get_by_user(user_id)

    async def create_user_attempt(self, attempt_data: dict) -> UserQuizAttempt:
        return await self.attempt_repo.create(attempt_data)