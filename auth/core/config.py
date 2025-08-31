# core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GIGACHAT_AUTHORIZATION_KEY: str
    GIGACHAT_ACCESS_KEY: str
    GIGACHAT_ACCESS_KEY_EXPIRED_AT: str
    DATABASE_URL: str
    ALGORITHM: str
    JWT_SECRET_KEY: str

    class Config:
        env_file = "auth/.env"

settings = Settings()
