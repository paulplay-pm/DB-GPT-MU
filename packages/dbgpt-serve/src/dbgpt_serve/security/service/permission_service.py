from typing import Optional, List
from ..dao.permission_dao import SysPermissionDao
from ..models.permission import SysPermission
from ..models.user_role import SysUserRole
from ..models.role_permission import SysRolePermission
from dbgpt.storage.metadata import BaseDao


class SysPermissionService:
    """Service for sys_permission operations"""

    def __init__(self):
        self._dao = SysPermissionDao()

    def get_by_id(self, id: int) -> Optional[SysPermission]:
        return self._dao.get_by_id(id)

    def list_permissions(self) -> List[SysPermission]:
        return self._dao.get_all()

    def get_all_permissions_tree(self) -> List[dict]:
        """Get permission tree structure"""
        all_perms = self._dao.get_all()
        return self._build_tree(all_perms, None)

    def _build_tree(self, perms: List[SysPermission], parent_id: int) -> List[dict]:
        result = []
        for perm in perms:
            if perm.parent_id == parent_id:
                node = {
                    "id": perm.id,
                    "code": perm.code,
                    "name": perm.name,
                    "parent_id": perm.parent_id,
                    "level": perm.level,
                    "sort": perm.sort,
                    "children": self._build_tree(perms, perm.id)
                }
                result.append(node)
        return result

    def get_user_permissions(self, user_id: int) -> List[str]:
        """Get user's effective permission codes from roles"""
        base_dao = BaseDao()
        with base_dao.session() as session:
            # 1. Query user's role IDs
            user_roles = session.query(SysUserRole).filter(
                SysUserRole.user_id == user_id
            ).all()
            role_ids = [ur.role_id for ur in user_roles]
            if not role_ids:
                return []

            # 2. Query permissions for these roles
            role_perms = session.query(SysRolePermission).filter(
                SysRolePermission.role_id.in_(role_ids)
            ).all()
            perm_ids = [rp.permission_id for rp in role_perms]
            if not perm_ids:
                return []

            # 3. Query permission codes
            perms = session.query(SysPermission).filter(
                SysPermission.id.in_(perm_ids)
            ).all()
            return [p.code for p in perms]