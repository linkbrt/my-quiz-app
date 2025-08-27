from fastapi import APIRouter
from questions.api.v1 import quizzes

router = APIRouter()

router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])