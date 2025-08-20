# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GIGACHAT_AUTHORIZATION_KEY: str
    GIGACHAT_ACCESS_KEY: str
    GIGACHAT_ACCESS_KEY_EXPIRED_AT: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str

    class Config:
        env_file = ".env"

settings = Settings()
