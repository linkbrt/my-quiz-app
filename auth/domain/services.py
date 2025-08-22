from .models import UserCreate
from auth.infrastructure.repositories.user_repo import UserRepository
from auth.infrastructure.repositories.token_repo import TokenRepository
from auth.core.security import get_password_hash, verify_password

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    def get_all(self):
        """Получить всех пользователей."""
        return self.user_repo.get_all()

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
    
    def verify_user(self, username: str, password: str):
        """Проверить пользователя по имени и паролю."""
        user = self.user_repo.get_by_username(username)
        if user and verify_password(password, user.hashed_password):
            return user
        return None
    
    def delete_user(self, user_id: str):
        """Удалить пользователя по ID."""
        user = self.user_repo.get_by_id(user_id)
        if user:
            self.user_repo.delete(user)
            return True
        return False


class TokenService:
    def __init__(self, token_repo: TokenRepository):
        self.token_repo = token_repo

    def get_token_by_user_id(self, user_id: str):
        """Получить токен по ID пользователя."""
        return self.token_repo.get_by_user_id(user_id)

    def create_token(self, user_id: str):
        """Создать новый токен для пользователя."""
        return self.token_repo.create(user_id)