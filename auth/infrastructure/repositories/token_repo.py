# infrastructure/repositories/token_repo.py
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from auth.infrastructure.db import Base
import jwt

from auth.core.config import settings


class TokenModel(Base):
    __tablename__ = "tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    access_token = Column(String)
    user_id = Column(UUID(as_uuid=True), index=True)


class TokenRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: str):
        # Преобразуем строку в UUID
        return self.db.query(TokenModel).filter(TokenModel.user_id == uuid.UUID(user_id)).first()

    def create(self, user_id: str):
        db_token = TokenModel(
            id=uuid.uuid4(),
            access_token=jwt.encode({"user_id": user_id}, settings.JWT_SECRET_KEY, algorithm="HS256"),
            user_id=uuid.UUID(user_id)  # <-- Исправлено: преобразуем строку в UUID
        )
        self.db.add(db_token)
        self.db.commit()
        self.db.refresh(db_token)
        return db_token