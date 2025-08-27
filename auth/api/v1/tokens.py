# api/v1/tokens.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from auth.domain.models import Token, TokenUserData
from auth.domain.services import TokenService, UserService
from auth.infrastructure.repositories.token_repo import TokenRepository
from auth.infrastructure.repositories.user_repo import UserRepository
from auth.infrastructure.db import get_db


router = APIRouter()

def get_token_service(db: AsyncSession = Depends(get_db)) -> TokenService:
    token_repo = TokenRepository(db)
    return TokenService(token_repo)

def get_user_service(db: AsyncSession = Depends(get_db)) -> UserService:
    user_repo = UserRepository(db)
    return UserService(user_repo)


@router.post("/obtain_token", response_model=Token, status_code=status.HTTP_201_CREATED)
async def obtain_token(
    user_data: TokenUserData,
    service: TokenService = Depends(get_token_service),
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.verify_user(user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    data = {"user_id": str(user.id), "is_admin": user.is_admin}
    token = await service.create_token(data)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": token.access_token, "token_type": "bearer"}

async def authorize_token(
    token: str,
    service: TokenService = Depends(get_token_service)
):
    token_data = await service.token_repo.get_by_access_token(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_data
