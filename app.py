# app.py
from fastapi import FastAPI
from auth.api.main import router as api_v1_router
from auth.infrastructure.db import Base, engine

# Создаем таблицы в базе данных (если их еще нет)
Base.metadata.create_all(bind=engine)

# Создаем экземпляр FastAPI
app = FastAPI(
    title="Auth API",
    description="A auth application API",
    version="1.0.0"
)

# Подключаем роутеры из /api/v1
app.include_router(api_v1_router, prefix="/api/v1")
