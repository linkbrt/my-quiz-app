from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from questions.domain.services import QuizService
from questions.infrastructure.repositories.questions_repo import (
    SectionRepository,
    QuizRepository,
    QuestionRepository,
    UserQuizAttemptRepository,
)
from questions.infrastructure.db import get_db
from questions.api.v1.schemas import SectionSchema

router = APIRouter()

def get_quiz_service(db: AsyncSession = Depends(get_db)) -> QuizService:
    section_repo = SectionRepository(db)
    quiz_repo = QuizRepository(db)
    question_repo = QuestionRepository(db)
    attempt_repo = UserQuizAttemptRepository(db)
    return QuizService(section_repo, quiz_repo, question_repo, attempt_repo)

@router.get("/", response_model=List[SectionSchema])
async def list_sections(service: QuizService = Depends(get_quiz_service)):
    return await service.list_sections()

@router.get("/{section_id}", response_model=SectionSchema)
async def get_section(section_id: UUID, service: QuizService = Depends(get_quiz_service)):
    section = await service.get_section(section_id)
    if not section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return section

@router.post("/", response_model=SectionSchema, status_code=status.HTTP_201_CREATED)
async def create_section(section_data: dict, service: QuizService = Depends(get_quiz_service)):
    return await service.create_section(section_data)

@router.put("/{section_id}", response_model=SectionSchema)
async def update_section(section_id: UUID, section_data: dict, service: QuizService = Depends(get_quiz_service)):
    updated_section = await service.update_section(section_id, section_data)
    if not updated_section:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return updated_section

@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(section_id: UUID, service: QuizService = Depends(get_quiz_service)):
    success = await service.delete_section(section_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return
