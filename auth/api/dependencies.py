import os
from fastapi import Depends, HTTPException, status
from infrastructure.external_api.auth_client import ExternalAPIAuthClient
from core import config
from dotenv import load_dotenv


_external_api_auth_client: ExternalAPIAuthClient | None = None

async def get_external_api_client() -> ExternalAPIAuthClient:
    global _external_api_auth_client
    if _external_api_auth_client is None:
        _external_api_auth_client = ExternalAPIAuthClient(
            "https://ngw.devices.sberbank.ru:9443/api/v2/oauth",
            config.settings.GIGACHAT_AUTHORIZATION_KEY
        )

        try:
            await _external_api_auth_client._perform_token_refresh()
        except Exception as e:
            print(f"WARNING: Initial token fetch failed during startup: {e}")

    yield _external_api_auth_client
    
