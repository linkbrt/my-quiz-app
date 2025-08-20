from fastapi import APIRouter
from auth.api.v1 import users, messages_router

router = APIRouter()

router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(messages_router, prefix="/messages", tags=["Messages"])
