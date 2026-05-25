from typing import Optional, List
from ..dao.role_dao import SysRoleDao
from ..models.role import SysRole


class SysRoleService:
    """Service for sys_role operations"""

    def __init__(self):
        self._dao = SysRoleDao()

    def get_by_id(self, id: int) -> Optional[SysRole]:
        return self._dao.get_by_id(id)

    def get_by_code(self, code: str) -> Optional[SysRole]:
        return self._dao.get_by_code(code)

    def list_roles(self) -> List[SysRole]:
        return self._dao.get_all()

    def create_role(self, **kwargs) -> SysRole:
        return self._dao.create(**kwargs)

    def update_role(self, id: int, **kwargs) -> Optional[SysRole]:
        return self._dao.update(id, **kwargs)

    def delete_role(self, id: int) -> bool:
        return self._dao.delete(id)