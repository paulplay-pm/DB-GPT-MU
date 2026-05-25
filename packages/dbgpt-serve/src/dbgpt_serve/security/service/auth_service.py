import bcrypt
from typing import Optional, Tuple
from .user_service import SysUserService


class AuthService:
    """Authentication service for login/logout"""

    def __init__(self):
        self._user_service = SysUserService()

    def verify_password(self, raw_password: str, password_hash: str) -> bool:
        """Verify password against bcrypt hash"""
        return bcrypt.checkpw(
            raw_password.encode("utf-8"),
            password_hash.encode("utf-8"),
        )

    def hash_password(self, password: str) -> str:
        """Hash password with bcrypt"""
        return bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt(),
        ).decode("utf-8")

    def authenticate(
        self, login_name: str, password: str
    ) -> Tuple[Optional[dict], Optional[str]]:
        """
        Authenticate user by login_name and password.
        Returns (user_dict, error_message)
        """
        user = self._user_service.get_user_by_login_name(login_name)
        if not user:
            return None, "用户名或密码错误"

        if not user.is_active:
            return None, "账户已被禁用"

        if not self.verify_password(password, user.password_hash):
            return None, "用户名或密码错误"

        return self._user_to_dict(user), None

    def _user_to_dict(self, user) -> dict:
        """Convert user entity to dict (without password_hash)"""
        return {
            "id": user.id,
            "user_id": user.user_id,
            "login_name": user.login_name,
            "real_name": user.real_name,
            "email": user.email,
            "dept_id": user.dept_id,
            "is_active": user.is_active,
            "is_super_admin": user.is_super_admin,
        }