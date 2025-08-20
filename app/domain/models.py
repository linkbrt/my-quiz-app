# domain/models.py
from pydantic import BaseModel, EmailStr, UUID4
import uuid


class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID4
    is_active: bool

    class Config:
        orm_mode = True
