import bcrypt
from typing import Optional, List
from dbgpt.storage.metadata import BaseDao
from ..dao.user_dao import SysUserDao
from ..models.user import SysUser
from ..models.user_role import SysUserRole


class SysUserService:
    """Service for sys_user operations"""

    def __init__(self):
        self._dao = SysUserDao()

    def get_user_by_login_name(self, login_name: str) -> Optional[SysUser]:
        return self._dao.get_by_login_name(login_name)

    def get_user_by_id(self, id: int) -> Optional[SysUser]:
        return self._dao.get_by_id(id)

    def list_users(self, page: int = 1, page_size: int = 20) -> List[SysUser]:
        """List users with pagination"""
        return self._dao.get_all()

    def get_all(self) -> List[SysUser]:
        """Get all users"""
        return self._dao.get_all()

    def create_user(self, **kwargs) -> SysUser:
        """Create new user"""
        # Hash the password if provided
        if 'password' in kwargs:
            password = kwargs.pop('password')
            kwargs['password_hash'] = bcrypt.hashpw(
                password.encode('utf-8'),
                bcrypt.gensalt()
            ).decode('utf-8')
        return self._dao.create(**kwargs)

    def update_user(self, id: int, **kwargs) -> Optional[SysUser]:
        """Update user"""
        return self._dao.update(id, **kwargs)

    def update_user_roles(self, user_id: int, role_ids: List[int]):
        """Update user's roles via sys_user_role table"""
        base_dao = BaseDao()
        with base_dao.session() as session:
            # Delete existing roles
            session.query(SysUserRole).filter(SysUserRole.user_id == user_id).delete()
            # Add new roles
            for role_id in role_ids:
                session.add(SysUserRole(user_id=user_id, role_id=role_id))

    def get_user_permissions(self, user_id: int) -> List[str]:
        """Get user's effective permissions (from roles)"""
        # This will query through role -> permission chain
        # For now, return empty list
        return []

    def get_user_roles(self, user_id: int) -> List[int]:
        """Get user's role IDs"""
        base_dao = BaseDao()
        with base_dao.session() as session:
            user_roles = session.query(SysUserRole).filter(
                SysUserRole.user_id == user_id
            ).all()
            return [ur.role_id for ur in user_roles]