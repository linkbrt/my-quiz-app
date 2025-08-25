from .models import UserCreate
from auth.infrastructure.repositories.user_repo import UserRepository
from auth.infrastructure.repositories.token_repo import TokenRepository
from auth.core.security import get_password_hash, verify_password

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_all(self):
        """Получить всех пользователей."""
        return await self.user_repo.get_all()

    async def get_user_by_id(self, user_id: str):
        """Получить пользователя по ID."""
        return await self.user_repo.get_by_id(user_id)

    async def create_user(self, user_data: UserCreate):
        """Создать нового пользователя."""
        db_user = await self.user_repo.get_by_email(user_data.email)
        if db_user:
            return None

        hashed_password = get_password_hash(user_data.password)

        return await self.user_repo.create(user_data, hashed_password)
    
    async def verify_user(self, username: str, password: str):
        """Проверить пользователя по имени и паролю."""
        user = await self.user_repo.get_by_username(username)
        if user and verify_password(password, user.hashed_password):
            return user
        return None
    
    async def delete_user(self, user_id: str):
        """Удалить пользователя по ID."""
        user = await self.user_repo.get_by_id(user_id)
        if user:
            await self.user_repo.delete(user)
            return True
        return False


class TokenService:
    def __init__(self, token_repo: TokenRepository):
        self.token_repo = token_repo

    async def get_token_by_user_id(self, user_id: str):
        return await self.token_repo.get_by_user_id(user_id)

    async def create_token(self, user_id: str):
        token = await self.get_token_by_user_id(user_id)
        if token:
            await self.token_repo.delete(token)

        return await self.token_repo.create(user_id)