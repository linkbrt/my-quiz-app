from fastapi import APIRouter
from questions.api.v1 import quizzes, questions, sections

router = APIRouter()

router.include_router(quizzes.router, prefix="/quizzes", tags=["quizzes"])
router.include_router(questions.router, prefix="/questions", tags=["questions"])
router.include_router(sections.router, prefix="/sections", tags=["sections"])