# infrastructure/repositories/user_repo.py
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, String, Boolean, Column
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
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all(self):
        result = await self.db.execute(select(UserModel))
        return result.scalars().all()

    async def get_by_id(self, user_id: str):
        result = await self.db.execute(select(UserModel).where(UserModel.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str):
        result = await self.db.execute(select(UserModel).where(UserModel.email == email))
        return result.scalar_one_or_none()
    
    async def get_by_username(self, username: str):
        result = await self.db.execute(select(UserModel).where(UserModel.username == username))
        return result.scalar_one_or_none()

    async def create(self, user_data: UserCreate, hashed_password: str):
        db_user = UserModel(
            id=uuid.uuid4(),
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_password
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user
    
    async def delete(self, user: UserModel):
        await self.db.delete(user)
        await self.db.commit()
        return True
