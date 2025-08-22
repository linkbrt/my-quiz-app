# api/v1/tokens.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from auth.domain.models import Token, TokenCreate
from auth.domain.services import TokenService, UserService
from auth.infrastructure.repositories.token_repo import TokenRepository
from auth.infrastructure.repositories.user_repo import UserRepository
from auth.infrastructure.db import get_db
from auth.api.dependencies import get_external_api_client


router = APIRouter()

def get_token_service(db: Session = Depends(get_db)) -> TokenService:
    token_repo = TokenRepository(db)
    return TokenService(token_repo)

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    user_repo = UserRepository(db)
    return UserService(user_repo)


@router.post("/obtain_token", response_model=Token, status_code=status.HTTP_201_CREATED)
def obtain_token(username: str, password: str, 
                 service: TokenService = Depends(get_token_service),
                 user_service: UserService = Depends(get_user_service)):
    user = user_service.verify_user(username, password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = service.create_token(str(user.id))
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Логика создания и возврата токена
    return {"access_token": token.access_token, "token_type": "bearer"}
