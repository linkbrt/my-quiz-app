from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID

from questions.domain.services import QuizService
from questions.infrastructure.repositories.questions_repo import (
    SectionRepository,
    QuizRepository,
    QuestionRepository,
)
from questions.infrastructure.db import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from questions.api.v1.schemas import (
    QuizSchema,
    QuizFullSchema,
    QuestionSchema,
)

router = APIRouter()

def get_quiz_service(db: AsyncSession = Depends(get_db)) -> QuizService:
    section_repo = SectionRepository(db)
    quiz_repo = QuizRepository(db)
    question_repo = QuestionRepository(db)
    return QuizService(section_repo, quiz_repo, question_repo)


@router.get("/", response_model=List[QuizSchema])
async def list_quizzes(service: QuizService = Depends(get_quiz_service)):
    return await service.list_quizzes()

@router.get("/{quiz_id}", response_model=QuizFullSchema)
async def get_quiz(quiz_id: UUID, service: QuizService = Depends(get_quiz_service)):
    quiz = await service.get_quiz(quiz_id)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    questions = await service.list_questions_by_quiz(quiz.id)

    return {"quiz": quiz, "questions": questions}

@router.get("/full/{quiz_id}", response_model=QuizFullSchema)
async def get_quiz_full_info(quiz_id: UUID, service: QuizService = Depends(get_quiz_service)):
    quiz = await service.get_quiz(quiz_id)
    if not quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    questions = await service.list_questions_by_quiz(quiz.id)

    return {"quiz": quiz, "questions": questions}

@router.post("/", response_model=QuizSchema, status_code=status.HTTP_201_CREATED)
async def create_quiz(quiz_data: dict, service: QuizService = Depends(get_quiz_service)):
    return await service.create_quiz(quiz_data)

@router.put("/{quiz_id}", response_model=QuizSchema)
async def update_quiz(quiz_id: UUID, quiz_data: dict, service: QuizService = Depends(get_quiz_service)):
    updated_quiz = await service.update_quiz(quiz_id, quiz_data)
    if not updated_quiz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    return updated_quiz

@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_quiz(quiz_id: UUID, service: QuizService = Depends(get_quiz_service)):
    success = await service.delete_quiz(quiz_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found")
    return

@router.get("/section/{section_id}", response_model=List[QuizSchema])
async def list_quizzes_by_section(section_id: UUID, service: QuizService = Depends(get_quiz_service)):
    return await service.list_quizzes_by_section(section_id)

@router.get("/{quiz_id}/questions", response_model=List[QuestionSchema])
async def list_questions_by_quiz(quiz_id: UUID, service: QuizService = Depends(get_quiz_service)):
    return await service.list_questions_by_quiz(quiz_id)
