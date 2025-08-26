from fastapi import APIRouter
from questions.api.v1 import questions, tests

router = APIRouter()

# router.include_router(questions.router, prefix="/questions", tags=["Questions"])
# router.include_router(tests.router, prefix="/tests", tags=["Tests"])