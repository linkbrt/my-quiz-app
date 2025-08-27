# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from questions.api.main import router as api_v1_router
from questions.infrastructure.db import Base, engine


# Создаем экземпляр FastAPI
app = FastAPI(
    title="Auth API",
    description="A auth application API",
    version="1.0.0"
)

origins = [
    "http://localhost",
    "http://localhost:5173", # Порт, на котором работает ваш React-фронтенд
    "http://localhost:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # Разрешенные источники
    allow_credentials=True,         # Разрешить куки и заголовки авторизации (Bearer Token)
    allow_methods=["*"],            # Разрешить все HTTP-методы (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"],            # Разрешить все заголовки запросов, включая кастомные (например, X-User-ID)
)

# Подключаем роутеры из /api/v1
app.include_router(api_v1_router, prefix="/api/v1")
