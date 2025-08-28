

from typing import Annotated
import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from questions.core.config import settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Зависимость FastAPI, которая декодирует JWT токен, извлекает из него информацию
    и возвращает объект User.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        if user_id is None:
            raise credentials_exception
        
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = {
        "user_id": payload.get("user_id"),
        "is_admin": payload.get("is_admin"),
    }
    return user

