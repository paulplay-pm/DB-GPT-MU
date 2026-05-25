import bcrypt
from typing import Optional, List
from ..dao.registration_dao import SysRegistrationDao
from ..dao.user_dao import SysUserDao
from ..models.registration import SysRegistration
from ..models.user import SysUser


class RegistrationService:
    """Service for registration application operations"""

    def __init__(self):
        self._dao = SysRegistrationDao()
        self._user_dao = SysUserDao()

    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')

    def create_application(self, login_name: str, password: str, real_name: str = None,
                          email: str = None, dept_id: int = None) -> SysRegistration:
        """Create new registration application"""
        # Check if login_name already exists
        existing = self._user_dao.get_by_login_name(login_name)
        if existing:
            raise ValueError("用户名已存在")

        existing_reg = self._dao.get_by_login_name(login_name)
        if existing_reg:
            raise ValueError("该用户名正在等待审核")

        password_hash = self.hash_password(password)
        return self._dao.create(
            login_name=login_name,
            password_hash=password_hash,
            real_name=real_name,
            email=email,
            dept_id=dept_id,
            status="pending"
        )

    def list_applications(self, status: str = None) -> List[SysRegistration]:
        """List registration applications"""
        if status:
            return self._dao.get_by_status(status)
        return self._dao.get_all()

    def approve(self, registration_id: int, dept_id: int = None, role_ids: List[int] = None) -> SysUser:
        """Approve registration and create user"""
        reg = self._dao.get_by_id(registration_id)
        if not reg:
            raise ValueError("Registration not found")
        if reg.status != "pending":
            raise ValueError("Registration already processed")

        # Create user
        user = self._user_dao.create(
            user_id=f"user_{reg.login_name}_{reg.id}",
            login_name=reg.login_name,
            password_hash=reg.password_hash,
            real_name=reg.real_name,
            email=reg.email,
            dept_id=dept_id or reg.dept_id
        )

        # Update registration status
        self._dao.update_status(registration_id, "approved")

        # TODO: Assign roles if role_ids provided

        return user

    def reject(self, registration_id: int, reason: str):
        """Reject registration"""
        reg = self._dao.get_by_id(registration_id)
        if not reg:
            raise ValueError("Registration not found")
        if reg.status != "pending":
            raise ValueError("Registration already processed")

        self._dao.update_status(registration_id, "rejected", reason)