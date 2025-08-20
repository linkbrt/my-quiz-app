# api/v1/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from domain.models import User, UserCreate
from domain.services import UserService
from infrastructure.repositories.user_repo import UserRepository
from infrastructure.db import get_db

import requests

router = APIRouter()

def get_user_service(db: Session = Depends(get_db)) -> UserService:
    user_repo = UserRepository(db)
    return UserService(user_repo)


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

@router.get("/obtain_token")
def obtain_token():
    url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"

    payload={}
    headers = {
    'Accept': 'application/json',
    'Authorization': 'Bearer <Access token>'
    }

    response = requests.request("GET", url, headers=headers, data=payload, verify=False)

    print(response.text)


@router.get("/{user_id}", response_model=User)
def read_user(
    user_id: str,
    service: UserService = Depends(get_user_service)
):
    """
    Получение информации о пользователе по его ID.
    """
    db_user = service.get_user_by_id(user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
