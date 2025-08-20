from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import requests

router = APIRouter()

class MessageRequest(BaseModel):
    user_id: int
    message: str

@router.post("/send-message/")
async def send_message(request: MessageRequest):
    response = requests.post(
        url="https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
        headers={
            'Content-Type': "application/json",
            'Accept': "application/json",
        },
        data={
            
        },
    )
    return {"status": "Message sent", "user_id": request.user_id}
