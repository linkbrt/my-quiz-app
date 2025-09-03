from uuid import UUID
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime

class SectionSchema(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    order_index: int
    is_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class GetSectionInfoSchema(BaseModel):
    section: SectionSchema
    quizzes: List["QuizSchema"]

class SectionFilter(BaseModel):
    title: str
    description: str
    is_published: bool = False
    quiz: UUID

class QuizSchema(BaseModel):
    id: UUID
    section_id: UUID
    title: str
    description: Optional[str]
    num_questions_to_show: int
    passing_score: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class QuizFullSchema(BaseModel):
    quiz: QuizSchema
    questions: List["QuestionSchema"]

class QuestionSchema(BaseModel):
    id: UUID
    quiz_id: UUID
    question_text: str
    question_type: str
    explanation: Optional[str]
    order_index: int
    answers: list
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
