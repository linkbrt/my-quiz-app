# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GIGACHAT_AUTHORIZATION_KEY: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str

    class Config:
        env_file = ".env"

settings = Settings()
