# infrastructure/repositories/user_repo.py
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from auth.infrastructure.db import Base
from auth.domain.models import UserCreate


class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str):
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def get_by_email(self, email: str):
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def create(self, user_data: UserCreate, hashed_password: str):
        # Создаем объект модели SQLAlchemy
        db_user = UserModel(
            id=uuid.uuid4(), # Генерируем новый UUID
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password
        )
        # Добавляем в сессию и сохраняем в БД
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user