# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str
    DATABASE_URL: str
    JWT_SECRET_KEY: str

    class Config:
        env_file = "questions/.env"

settings = Settings()
