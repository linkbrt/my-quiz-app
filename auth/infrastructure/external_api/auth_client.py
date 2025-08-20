import httpx
import time
import asyncio
import uuid


class ExternalAPIAuthClient:
    def __init__(self, token_url: str, secret_key: str):
        self._token_url = token_url
        self._secret_key = secret_key
        self._expires_at = float = 0
        self._refresh_lock = asyncio.Lock()
        self._access_token = ""

    async def _perform_token_refresh(self) -> None:
        try:
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.post(
                    self._token_url,
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded",
                        'Accept': 'application/json',
                        'Authorization': f'Bearer {self._secret_key}',
                        'RqUID': str(uuid.uuid4()),
                    },
                    data={
                        "scope": "GIGACHAT_API_PERS",
                    }
                )

                response.raise_for_status()
                data = response.json()

                self._access_token = data.get("access_token")
                expires_in = data.get("expires_in")

        except httpx.HTTPStatusError as e:
            print(f"ERROR: HTTP error during token refresh: {e.response.status_code} - {e.response.text}")
            self._access_token = None # Invalidate token on error
            self._expires_at = 0
            raise
        except httpx.RequestError as e:
            print(f"ERROR: Network error during token refresh: {e}")
            self._access_token = None
            self._expires_at = 0
            raise
        except Exception as e:
            print(f"ERROR: Unexpected error during token refresh: {e}")
            self._access_token = None
            self._expires_at = 0
            raise
