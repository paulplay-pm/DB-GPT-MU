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

    def _build_tree(self, perms: List[SysPermission], parent_code: str) -> List[dict]:
        result = []
        for perm in perms:
            if perm.parent_code == parent_code:
                node = {
                    "id": perm.id,
                    "code": perm.code,
                    "name": perm.name,
                    "parent_code": perm.parent_code,
                    "perm_type": perm.perm_type,
                    "sort": perm.sort,
                    "children": self._build_tree(perms, perm.code)
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

    def get_role_permissions(self, role_id: int) -> List[int]:
        """Get permission IDs for a role"""
        base_dao = BaseDao()
        with base_dao.session() as session:
            role_perms = session.query(SysRolePermission).filter(
                SysRolePermission.role_id == role_id
            ).all()
            return [rp.permission_id for rp in role_perms]

    def add_permission_to_role(self, role_id: int, permission_id: int):
        """Add permission to role"""
        base_dao = BaseDao()
        with base_dao.session() as session:
            existing = session.query(SysRolePermission).filter(
                SysRolePermission.role_id == role_id,
                SysRolePermission.permission_id == permission_id
            ).first()
            if not existing:
                rp = SysRolePermission(role_id=role_id, permission_id=permission_id)
                session.add(rp)

    def remove_permission_from_role(self, role_id: int, permission_id: int):
        """Remove permission from role"""
        base_dao = BaseDao()
        with base_dao.session() as session:
            session.query(SysRolePermission).filter(
                SysRolePermission.role_id == role_id,
                SysRolePermission.permission_id == permission_id
            ).delete()

    def update_role_permissions(self, role_id: int, permission_ids: List[int]):
        """Update role's permissions (replace all)"""
        base_dao = BaseDao()
        with base_dao.session() as session:
            session.query(SysRolePermission).filter(
                SysRolePermission.role_id == role_id
            ).delete()
            for perm_id in permission_ids:
                session.add(SysRolePermission(role_id=role_id, permission_id=perm_id))
            session.commit()