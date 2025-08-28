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

class QuestionSchema(BaseModel):
    id: UUID
    quiz_id: UUID
    question_text: Dict[str, Any]
    question_type: str
    explanation: Optional[str]
    order_index: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class UserQuizAttemptSchema(BaseModel):
    id: UUID
    user_id: UUID
    quiz_id: UUID
    score: Decimal
    started_at: datetime
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True