from typing import Optional
from ..dao.user_dao import SysUserDao
from ..models.user import SysUser


class SysUserService:
    """Service for sys_user operations"""

    def __init__(self):
        self._dao = SysUserDao()

    def get_user_by_login_name(self, login_name: str) -> Optional[SysUser]:
        return self._dao.get_by_login_name(login_name)

    def get_user_by_id(self, id: int) -> Optional[SysUser]:
        return self._dao.get_by_id(id)