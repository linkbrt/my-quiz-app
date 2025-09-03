import uuid
from datetime import datetime
from enum import Enum as PyEnum

import sqlalchemy
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, DateTime, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func

from questions.infrastructure.db import Base

class QuestionType(PyEnum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    TEXT_INPUT = "text_input"


class LanguageType(PyEnum):
    PYTHON = "python"
    CSHARP = "csharp"

class Section(Base):
    __tablename__ = 'sections'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    order_index = Column(Integer, unique=True, nullable=False)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    quizzes = relationship("Quiz", back_populates="section", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Section(title='{self.title}', order_index={self.order_index})>"

class Quiz(Base):
    __tablename__ = 'quizzes'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey('sections.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    num_questions_to_show = Column(Integer, default=10, nullable=False)
    passing_score = Column(DECIMAL(5,2), default=0.70, nullable=False)
    language_type = Column(sqlalchemy.Enum(LanguageType, name='language_type_enum', create_type=True), default=LanguageType.PYTHON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    section = relationship("Section", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    __table_args__ = (sqlalchemy.UniqueConstraint('section_id', 'title', name='_section_quiz_title_uc'),)

    def __repr__(self):
        return f"<Quiz(title='{self.title}', section_id='{self.section_id}')>"

class Question(Base):
    __tablename__ = 'questions'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    question_text = Column(JSONB, nullable=False)
    question_type = Column(sqlalchemy.Enum(QuestionType, name='question_type_enum', create_type=True), default=QuestionType.SINGLE_CHOICE, nullable=False)
    explanation = Column(Text)
    order_index = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    quiz = relationship("Quiz", back_populates="questions")
    answers = Column(JSONB, nullable=True)
    __table_args__ = (sqlalchemy.UniqueConstraint('quiz_id', 'order_index', name='_quiz_question_order_uc'),)

    def __repr__(self):
        return f"<Question(text_preview='{str(self.question_text)[:50]}...', quiz_id='{self.quiz_id}')>"
