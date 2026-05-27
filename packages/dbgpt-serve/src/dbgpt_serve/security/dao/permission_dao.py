from typing import Optional, List
from dbgpt.storage.metadata import BaseDao
from ..models.permission import SysPermission


class SysPermissionDao(BaseDao):
    """DAO for sys_permission table"""

    def get_by_id(self, id: int) -> Optional[SysPermission]:
        with self.session() as session:
            perm = session.query(SysPermission).filter(SysPermission.id == id).first()
            if perm:
                session.expunge(perm)
            return perm

    def get_all(self) -> List[SysPermission]:
        with self.session() as session:
            perms = session.query(SysPermission).all()
            for perm in perms:
                session.expunge(perm)
            return perms

    def get_by_codes(self, codes: List[str]) -> List[SysPermission]:
        with self.session() as session:
            perms = session.query(SysPermission).filter(
                SysPermission.code.in_(codes)
            ).all()
            for perm in perms:
                session.expunge(perm)
            return perms

    def get_children(self, parent_id: int) -> List[SysPermission]:
        with self.session() as session:
            perms = session.query(SysPermission).filter(
                SysPermission.parent_id == parent_id
            ).all()
            for perm in perms:
                session.expunge(perm)
            return perms