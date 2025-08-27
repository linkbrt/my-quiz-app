from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from api.dependencies import get_external_api_client
from infrastructure.external_api.auth_client import ExternalAPIAuthClient

import requests
import httpx
import json

router = APIRouter()

class MessageRequest(BaseModel):
    user_id: int
    message: str

@router.post("/send-message/")
async def send_message(request: MessageRequest, ai_token: ExternalAPIAuthClient = Depends(get_external_api_client)):
    # print(ai_token._access_token)
    try:
        async with httpx.AsyncClient(verify=False) as client:
            response = await client.post(
                url="https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
                headers={
                    "Accept": "application/json",
                    "Authorization": f"Bearer {ai_token._access_token}",
                },
                json={
                    "model": "GigaChat",
                    "messages": [
                        {
                            "role": "system",
                            "content": "Ты - интервьюер-сеньор в крупной IT компании. Ты должен проверить ответ пользователя на вопрос. В качестве ответа передавай значение типа (float) от 0 до 1.",
                        },
                        {
                            "role": "user",
                            "content": "Вопрос - Что такое БД; Ответ собеседника - База данных",
                        }
                    ],
                    "stream": False,
                    "update_interval": 0,
                }
            )
            
            # Print request details for debugging
            print(f"Request URL: {response.request.url}")
            print(f"Request Headers: {response.request.headers}")
            print(f"Request Body Sent (decoded): {response.request.content.decode('utf-8') if response.request.content else 'None'}")
            response.raise_for_status()
    
    except httpx.HTTPStatusError as e:
            print(f"ERROR: HTTP error during token refresh: {e.response.status_code} - {e.response.text}")
            raise
    except httpx.RequestError as e:
            print(f"ERROR: Network error during token refresh: {e}")
            raise
    except Exception as e:
            print(f"ERROR: Unexpected error during token refresh: {e}")
            raise

    return {"status": response.text, "user_id": request.user_id}
