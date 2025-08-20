from .models import UserCreate
from auth.infrastructure.repositories.user_repo import UserRepository
from auth.core.security import get_password_hash

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def get_user_by_id(self, user_id: str):
        """Получить пользователя по ID."""
        return self.user_repo.get_by_id(user_id)

    def create_user(self, user_data: UserCreate):
        """Создать нового пользователя."""
        db_user = self.user_repo.get_by_email(user_data.email)
        if db_user:
            return None
        
        hashed_password = get_password_hash(user_data.password)

        return self.user_repo.create(user_data, hashed_password)
