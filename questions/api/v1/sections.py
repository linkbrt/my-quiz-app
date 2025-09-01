from typing import List
from uuid import UUID
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from questions.domain.services import QuizService
from questions.infrastructure.repositories.questions_repo import (
    SectionRepository,
    QuizRepository,
    QuestionRepository,
    AnswerRepository,
    UserQuizAttemptRepository,
)
from questions.infrastructure.db import get_db
from questions.api.v1.schemas import SectionFilter, SectionSchema

router = APIRouter()

def get_quiz_service(db: AsyncSession = Depends(get_db)) -> QuizService:
    section_repo = SectionRepository(db)
    quiz_repo = QuizRepository(db)
    question_repo = QuestionRepository(db)
    answer_repo = AnswerRepository(db)
    attempt_repo = UserQuizAttemptRepository(db)
    return QuizService(section_repo, quiz_repo, question_repo, answer_repo, attempt_repo)

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

@router.post("/import_from_json", status_code=status.HTTP_201_CREATED)
async def import_from_json(content: str, section_id: str, service: QuizService = Depends(get_quiz_service)):
    parsed_content = json.loads(content)
    for quiz in parsed_content:
        db_quiz = await service.create_quiz({
            "section_id": section_id,
            "title": quiz.get('title'),
            "description": quiz.get('description'),
            "num_questions_to_show": quiz.get('num_questions_to_show'),
            "passing_score": quiz.get('passing_score'),
            "language_type": quiz.get('language_type'),
        })
        if not db_quiz:
            continue

        for question in quiz["questions"]:
            db_question = await service.create_question({
                "quiz_id": db_quiz.id,
                "question_text": question.get("question_text").get('text'),
                "question_type": question.get("question_type"),
                "explanation": question.get("explanation"),
                "order_index": question.get("order_index"),
            })

            for answer in question["answers"]:
                db_answer = await service.create_answer({
                    "question_id": db_question.id, 
                    "answer_text": answer.get("answer_text"),
                    "is_correct": answer.get("is_correct"),
                })
        return section_id
