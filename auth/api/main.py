from fastapi import APIRouter
from api.v1 import users, messages_router, tokens

router = APIRouter()

router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(messages_router, prefix="/messages", tags=["Messages"])
router.include_router(tokens.router, prefix="/tokens", tags=["Tokens"])
