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

        # Capture all scalar attributes immediately
        user_id = int(user.id)
        user_code = str(user.user_id)
        user_login_name = str(user.login_name)
        real_name = str(user.real_name) if user.real_name else ""
        email = str(user.email) if user.email else ""
        phone = str(user.phone) if user.phone else ""
        dept_id = int(user.dept_id) if user.dept_id else None
        is_active = bool(user.is_active)
        is_super_admin = bool(user.is_super_admin)

        return {
            "id": user_id,
            "user_id": user_code,
            "login_name": user_login_name,
            "real_name": real_name,
            "email": email,
            "phone": phone,
            "dept_id": dept_id,
            "is_active": is_active,
            "is_super_admin": is_super_admin,
            "permissions": ["*"] if is_super_admin else [],
        }, None

    def update_profile(self, user_id: int, real_name: str, email: str, phone: str, dept_id: Optional[int]) -> Tuple[Optional[dict], Optional[str]]:
        """Update user profile. Returns (user_dict, error_message)"""
        user = self._user_service.get_user_by_id(user_id)
        if not user:
            return None, "用户不存在"

        # Capture all scalar attributes immediately before session closes
        original_real_name = str(user.real_name) if user.real_name else ""
        original_email = str(user.email) if user.email else ""
        original_phone = str(user.phone) if user.phone else ""
        original_dept_id = int(user.dept_id) if user.dept_id else None

        self._user_service.update_user(
            user_id,
            real_name=real_name if real_name else original_real_name,
            email=email if email else original_email,
            phone=phone if phone else original_phone,
            dept_id=dept_id if dept_id is not None else original_dept_id,
        )
        return {
            "id": int(user.id),
            "user_id": str(user.user_id),
            "login_name": str(user.login_name),
            "real_name": str(real_name) if real_name else original_real_name,
            "email": str(email) if email else original_email,
            "phone": str(phone) if phone else original_phone,
            "dept_id": int(dept_id) if dept_id is not None else original_dept_id,
            "is_active": bool(user.is_active),
            "is_super_admin": bool(user.is_super_admin),
        }, None

    def change_password(self, user_id: int, old_password: str, new_password: str) -> Tuple[bool, Optional[str]]:
        """Change user password. Returns (success, error_message)"""
        user = self._user_service.get_user_by_id(user_id)
        if not user:
            return False, "用户不存在"

        # Capture password_hash immediately before session closes
        password_hash = str(user.password_hash)

        if not self.verify_password(old_password, password_hash):
            return False, "原密码错误"

        new_hash = self.hash_password(new_password)
        self._user_service.update_user(user_id, password_hash=new_hash)
        return True, None