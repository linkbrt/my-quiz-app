# app.py
from fastapi import FastAPI
from questions.api.main import router as api_v1_router
from questions.infrastructure.db import Base, engine


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Создаем экземпляр FastAPI
app = FastAPI(
    title="Auth API",
    description="A auth application API",
    version="1.0.0"
)


@app.on_event("startup")
async def on_startup():
    await create_tables()
    

# Подключаем роутеры из /api/v1
app.include_router(api_v1_router, prefix="/api/v1/tests")
