from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from questions.domain.services import QuizService
from questions.infrastructure.repositories.questions_repo import (
    SectionRepository,
    QuizRepository,
    QuestionRepository,
    UserQuizAttemptRepository,
)
from questions.infrastructure.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from questions.domain.models.questions import Section, Quiz, Question, UserQuizAttempt
from questions.api.v1.schemas import (
    SectionSchema,
    QuizSchema,
    QuestionSchema,
    UserQuizAttemptSchema,
)

router = APIRouter()

def get_quiz_service(db: AsyncSession = Depends(get_db)) -> QuizService:
    section_repo = SectionRepository(db)
    quiz_repo = QuizRepository(db)
    question_repo = QuestionRepository(db)
    attempt_repo = UserQuizAttemptRepository(db)
    return QuizService(section_repo, quiz_repo, question_repo, attempt_repo)

@router.get("/sections", response_model=List[SectionSchema])
async def list_sections(service: QuizService = Depends(get_quiz_service)):
    return await service.list_sections()

@router.get("/sections/{section_id}", response_model=SectionSchema)
async def get_section(section_id: UUID, service: QuizService = Depends(get_quiz_service)):
    section = await service.get_section(section_id)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return section

@router.get("/", response_model=List[QuizSchema])
async def list_quizzes(service: QuizService = Depends(get_quiz_service)):
    return await service.list_quizzes()

@router.get("/{quiz_id}", response_model=QuizSchema)
async def get_quiz(quiz_id: UUID, service: QuizService = Depends(get_quiz_service)):
    quiz = await service.get_quiz(quiz_id)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    return quiz

@router.get("/section/{section_id}", response_model=List[QuizSchema])
async def list_quizzes_by_section(section_id: UUID, service: QuizService = Depends(get_quiz_service)):
    return await service.list_quizzes_by_section(section_id)

@router.get("/{quiz_id}/questions", response_model=List[QuestionSchema])
async def list_questions_by_quiz(quiz_id: UUID, service: QuizService = Depends(get_quiz_service)):
    return await service.list_questions_by_quiz(quiz_id)

@router.get("/questions/{question_id}", response_model=QuestionSchema)
async def get_question(question_id: UUID, service: QuizService = Depends(get_quiz_service)):
    question = await service.get_question(question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return question

@router.get("/user/{user_id}/attempts", response_model=List[UserQuizAttemptSchema])
async def get_user_attempts(user_id: UUID, service: QuizService = Depends(get_quiz_service)):
    return await service.get_user_attempts(user_id)