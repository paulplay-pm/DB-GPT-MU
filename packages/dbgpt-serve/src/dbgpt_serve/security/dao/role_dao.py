from typing import Optional, List
from dbgpt.storage.metadata import BaseDao
from ..models.role import SysRole


class SysRoleDao(BaseDao):
    """DAO for sys_role table"""

    def get_by_id(self, id: int) -> Optional[SysRole]:
        with self.session() as session:
            return session.query(SysRole).filter(SysRole.id == id).first()

    def get_by_code(self, code: str) -> Optional[SysRole]:
        with self.session() as session:
            return session.query(SysRole).filter(SysRole.code == code).first()

    def get_all(self) -> List[SysRole]:
        with self.session() as session:
            return session.query(SysRole).filter(SysRole.is_active == True).all()

    def create(self, **kwargs) -> SysRole:
        with self.session() as session:
            role = SysRole(**kwargs)
            session.add(role)
            session.commit()
            session.refresh(role)
            return role

    def update(self, id: int, **kwargs) -> Optional[SysRole]:
        with self.session() as session:
            role = session.query(SysRole).filter(SysRole.id == id).first()
            if role:
                for key, value in kwargs.items():
                    if value is not None:
                        setattr(role, key, value)
                session.commit()
                session.refresh(role)
            return role

    def delete(self, id: int) -> bool:
        with self.session() as session:
            role = session.query(SysRole).filter(SysRole.id == id).first()
            if role:
                role.is_active = False
                session.commit()
                return True
            return False