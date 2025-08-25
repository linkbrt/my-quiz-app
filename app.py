# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth.api.main import router as api_v1_router
from auth.infrastructure.db import Base, engine


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Создаем экземпляр FastAPI
app = FastAPI(
    title="Auth API",
    description="A auth application API",
    version="1.0.0"
)


origins = [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:5173", # Если вы запускаете React dev-сервер напрямую без проброса
    "http://127.0.0.1",
    "http://127.0.0.1:80",
    "http://127.0.0.1:5173",
    # Добавьте любые другие домены/порты, с которых ваш фронтенд будет обращаться к бэкенду
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Разрешенные источники
    allow_credentials=True, # Разрешить отправку cookie в кросс-доменных запросах
    allow_methods=["*"], # Разрешить все методы (GET, POST, PUT, DELETE, OPTIONS и т.д.)
    allow_headers=["*"], # Разрешить все заголовки
)

@app.on_event("startup")
async def on_startup():
    await create_tables()
    

# Подключаем роутеры из /api/v1
app.include_router(api_v1_router, prefix="/api/v1")
