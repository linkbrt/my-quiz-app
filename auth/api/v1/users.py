# api/v1/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from auth.domain.models import User, UserCreate
from auth.domain.services import UserService
from auth.infrastructure.repositories.user_repo import UserRepository
from auth.infrastructure.db import get_db
from auth.api.dependencies import get_external_api_client

import uuid

router = APIRouter()

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    user_repo = UserRepository(db)
    return UserService(user_repo)


@router.get("/", response_model=list[User])
def list_users(
    service: UserService = Depends(get_user_service)
):
    """
    Получение списка всех пользователей.
    """
    users = service.get_all()
    return users

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    service: UserService = Depends(get_user_service)
):
    """
    Регистрация нового пользователя.
    """
    db_user = service.create_user(user_data)
    if db_user is None:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return db_user


@router.get("/{user_id}", response_model=User)
def read_user(
    user_id: str,
    service: UserService = Depends(get_user_service)
):
    """
    Получение информации о пользователе по его ID.
    """
    db_user = service.get_user_by_id(uuid.UUID(user_id))
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    service: UserService = Depends(get_user_service)
):
    """
    Удаление пользователя по его ID.
    """
    success = service.delete_user(uuid.UUID(user_id))
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return None
