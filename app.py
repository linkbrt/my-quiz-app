# app.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from api.main import router as api_v1_router
from infrastructure.db import Base, engine

# Создаем таблицы в базе данных (если их еще нет)
Base.metadata.create_all(bind=engine)

# Создаем экземпляр FastAPI
app = FastAPI(
    title="My Quiz App",
    description="A simple quiz application API",
    version="1.0.0"
)

# Подключаем роутеры из /api/v1
app.include_router(api_v1_router, prefix="/api/v1")

# Подключаем статическую папку 'public' для фронтенда
app.mount("/", StaticFiles(directory="public", html=True), name="static")

# Команда для запуска: uvicorn app:app --reload