from typing import Optional
from dbgpt.storage.metadata import BaseDao
from ..models.user import SysUser


class SysUserDao(BaseDao):
    """DAO for sys_user table"""

    def get_by_login_name(self, login_name: str) -> Optional[SysUser]:
        with self.session() as session:
            return session.query(SysUser).filter(
                SysUser.login_name == login_name
            ).first()

    def get_by_user_id(self, user_id: str) -> Optional[SysUser]:
        with self.session() as session:
            return session.query(SysUser).filter(
                SysUser.user_id == user_id
            ).first()

    def get_by_id(self, id: int) -> Optional[SysUser]:
        with self.session() as session:
            return session.query(SysUser).filter(SysUser.id == id).first()

    def create(self, **kwargs) -> SysUser:
        with self.session() as session:
            user = SysUser(**kwargs)
            session.add(user)
            return user

    def update_roles(self, user_id: int, role_ids: list[int]):
        """Update user roles via sys_user_role table"""
        from ..models.role import SysUserRole
        with self.session() as session:
            # Delete existing roles
            session.query(SysUserRole).filter(SysUserRole.user_id == user_id).delete()
            # Add new roles
            for role_id in role_ids:
                session.add(SysUserRole(user_id=user_id, role_id=role_id))