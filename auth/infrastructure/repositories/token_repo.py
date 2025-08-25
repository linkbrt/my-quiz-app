# infrastructure/repositories/token_repo.py
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import Column, String, select
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
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_id(self, user_id: str):
        result = await self.db.execute(
            select(TokenModel).where(TokenModel.user_id == uuid.UUID(user_id))
        )
        return result.scalar_one_or_none()

    async def create(self, user_id: str):
        db_token = TokenModel(
            id=uuid.uuid4(),
            access_token=jwt.encode({"user_id": user_id}, settings.JWT_SECRET_KEY, algorithm="HS256"),
            user_id=uuid.UUID(user_id),
        )
        self.db.add(db_token)
        await self.db.commit()
        await self.db.refresh(db_token)
        return db_token
    
    async def delete(self, token: TokenModel):
        await self.db.delete(token)
        await self.db.commit()
        return True
