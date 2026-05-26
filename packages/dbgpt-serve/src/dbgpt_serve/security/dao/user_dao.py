from typing import Optional, List
from dbgpt.storage.metadata import BaseDao
from ..models.user import SysUser


class SysUserDao(BaseDao):
    """DAO for sys_user table"""

    def get_by_login_name(self, login_name: str) -> Optional[SysUser]:
        with self.session() as session:
            user = session.query(SysUser).filter(
                SysUser.login_name == login_name
            ).first()
            if user:
                session.expunge(user)
            return user

    def get_by_user_id(self, user_id: str) -> Optional[SysUser]:
        with self.session() as session:
            return session.query(SysUser).filter(
                SysUser.user_id == user_id
            ).first()

    def get_by_id(self, id: int) -> Optional[SysUser]:
        with self.session() as session:
            return session.query(SysUser).filter(SysUser.id == id).first()

    def get_all(self) -> List[SysUser]:
        with self.session() as session:
            return session.query(SysUser).all()

    def update(self, id: int, **kwargs) -> Optional[SysUser]:
        with self.session() as session:
            user = session.query(SysUser).filter(SysUser.id == id).first()
            if user:
                for key, value in kwargs.items():
                    setattr(user, key, value)
            return user

    def create(self, **kwargs) -> SysUser:
        with self.session() as session:
            user = SysUser(**kwargs)
            session.add(user)
            return user