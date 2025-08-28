# app.py
import os
import alembic.config
import logging # Для логирования
import sys # Для возможного sys.exit


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from questions.api.main import router as api_v1_router


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_alembic_upgrade():
    """
    Запускает Alembic миграции для текущего микросервиса.
    """
    try:
        alembic_ini_path = os.path.join(os.path.dirname(__file__), "alembic.ini")
        
        if not os.path.exists(alembic_ini_path):
            logger.error(f"Alembic config file not found at: {alembic_ini_path}")
            raise FileNotFoundError(f"Alembic config file not found: {alembic_ini_path}")

        cfg = alembic.config.Config(alembic_ini_path)
        
        logger.info(f"Running Alembic migrations for Auth service using {alembic_ini_path}...")
        alembic.command.upgrade(cfg, "head")
        logger.info("Alembic migrations for Auth service completed successfully.")
    except Exception as e:
        logger.error(f"Error running Alembic migrations for Auth service: {e}", exc_info=True)
        sys.exit(1)

# Создаем экземпляр FastAPI
app = FastAPI(
    title="Questions API",
    description="A Questions application API",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI Questions service starting up...")
    # run_alembic_upgrade()

origins = [
    "http://localhost",
    "http://localhost:5173",
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
