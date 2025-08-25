# domain/models.py
from pydantic import BaseModel, EmailStr, UUID4


class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID4
    is_active: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str

class TokenCreate(Token):
    user_id: UUID4

class TokenUserData(BaseModel):
    username: str
    password: str
