import uuid
from datetime import datetime
from enum import Enum as PyEnum

import sqlalchemy
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, DateTime, DECIMAL
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func

from questions.infrastructure.db import Base

class QuestionType(PyEnum):
    SINGLE_CHOICE = "single_choice"
    MULTIPLE_CHOICE = "multiple_choice"
    TEXT_INPUT = "text_input"

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
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    section = relationship("Section", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    user_attempts = relationship("UserQuizAttempt", back_populates="quiz", cascade="all, delete-orphan")
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
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
    user_answers = relationship("UserQuestionAnswer", back_populates="question", cascade="all, delete-orphan")
    __table_args__ = (sqlalchemy.UniqueConstraint('quiz_id', 'order_index', name='_quiz_question_order_uc'),)

    def __repr__(self):
        return f"<Question(text_preview='{str(self.question_text)[:50]}...', quiz_id='{self.quiz_id}')>"

class Answer(Base):
    __tablename__ = 'answers'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    answer_text = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    question = relationship("Question", back_populates="answers")
    user_chosen_answers = relationship("UserQuestionAnswer", back_populates="chosen_answer", foreign_keys="[UserQuestionAnswer.chosen_answer_id]")

    def __repr__(self):
        return f"<Answer(text='{self.answer_text[:50]}...', is_correct={self.is_correct})>"

class UserQuizAttempt(Base):
    __tablename__ = 'user_quiz_attempts'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    quiz_id = Column(UUID(as_uuid=True), ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False)
    score = Column(DECIMAL(5,2))
    is_passed = Column(Boolean)
    attempt_number = Column(Integer, default=1, nullable=False)
    started_at = Column(DateTime(timezone=True), default=func.now())
    finished_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    quiz = relationship("Quiz", back_populates="user_attempts")
    question_answers = relationship("UserQuestionAnswer", back_populates="attempt", cascade="all, delete-orphan")
    __table_args__ = (sqlalchemy.UniqueConstraint('user_id', 'quiz_id', 'attempt_number', name='_user_quiz_attempt_uc'),)

    def __repr__(self):
        return f"<UserQuizAttempt(user_id='{self.user_id}', quiz_id='{self.quiz_id}', attempt='{self.attempt_number}')>"

class UserQuestionAnswer(Base):
    __tablename__ = 'user_question_answers'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey('user_quiz_attempts.id', ondelete='CASCADE'), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey('questions.id', ondelete='CASCADE'), nullable=False)
    chosen_answer_id = Column(UUID(as_uuid=True), ForeignKey('answers.id', ondelete='SET NULL'))
    is_correct = Column(Boolean)
    user_text_answer = Column(Text)
    answered_at = Column(DateTime(timezone=True), default=func.now())
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    attempt = relationship("UserQuizAttempt", back_populates="question_answers")
    question = relationship("Question", back_populates="user_answers")
    chosen_answer = relationship("Answer", foreign_keys=[chosen_answer_id], back_populates="user_chosen_answers")
    __table_args__ = (sqlalchemy.UniqueConstraint('attempt_id', 'question_id', name='_attempt_question_uc'),)

    def __repr__(self):
        return f"<UserQuestionAnswer(attempt_id='{self.attempt_id}', question_id='{self.question_id}', is_correct={self.is_correct})>"
