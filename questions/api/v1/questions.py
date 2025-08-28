from typing import Annotated
from uuid import UUID
import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from questions.domain.services import QuizService
from questions.infrastructure.repositories.questions_repo import (
    SectionRepository,
    QuizRepository,
    QuestionRepository,
    UserQuizAttemptRepository,
)
from questions.infrastructure.db import get_db
from questions.api.v1.schemas import (
    QuestionSchema,
)
from questions.infrastructure.dependencies import get_current_user


router = APIRouter()

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None

def get_user(db_users, username: str):
    user_data = db_users.get(username)
    if user_data:
        return User(**user_data)
    return None

def get_quiz_service(db: AsyncSession = Depends(get_db)) -> QuizService:
    section_repo = SectionRepository(db)
    quiz_repo = QuizRepository(db)
    question_repo = QuestionRepository(db)
    attempt_repo = UserQuizAttemptRepository(db)
    return QuizService(section_repo, quiz_repo, question_repo, attempt_repo)


@router.get("/", response_model=list[QuestionSchema])
async def list_questions(service: QuizService = Depends(get_quiz_service)):
    return await service.list_questions()

@router.get("/quiz/{quiz_id}", response_model=list[QuestionSchema])
async def list_questions_by_quiz(quiz_id: UUID, service: QuizService = Depends(get_quiz_service)):
    return await service.list_questions_by_quiz(quiz_id)

@router.get("/{question_id}", response_model=QuestionSchema)
async def get_question(question_id: UUID, service: QuizService = Depends(get_quiz_service)):
    question = await service.get_question(question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return question

@router.post("/", response_model=QuestionSchema, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: dict, 
    service: QuizService = Depends(get_quiz_service),
    current_user: Annotated[dict, Depends(get_current_user)] = None,
):
    return await service.create_question(question_data + current_user)

@router.put("/{question_id}", response_model=QuestionSchema)
async def update_question(question_id: UUID, question_data: dict, service: QuizService = Depends(get_quiz_service)):
    updated_question = await service.update_question(question_id, question_data)
    if not updated_question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return updated_question

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(question_id: UUID, service: QuizService = Depends(get_quiz_service)):
    success = await service.delete_question(question_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return
