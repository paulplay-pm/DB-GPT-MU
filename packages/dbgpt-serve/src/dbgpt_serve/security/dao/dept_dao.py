from typing import Optional, List
from dbgpt.storage.metadata import BaseDao
from ..models.dept import SysDept


class SysDeptDao(BaseDao):
    """DAO for sys_dept table"""

    def get_by_id(self, id: int) -> Optional[SysDept]:
        with self.session() as session:
            return session.query(SysDept).filter(SysDept.id == id).first()

    def get_all(self) -> List[SysDept]:
        with self.session() as session:
            return session.query(SysDept).filter(SysDept.is_active == True).all()

    def get_children(self, parent_id: int) -> List[SysDept]:
        with self.session() as session:
            return session.query(SysDept).filter(
                SysDept.parent_id == parent_id,
                SysDept.is_active == True
            ).all()

    def create(self, **kwargs) -> SysDept:
        with self.session() as session:
            dept = SysDept(**kwargs)
            session.add(dept)
            session.commit()
            return dept

    def update(self, id: int, **kwargs) -> Optional[SysDept]:
        with self.session() as session:
            dept = session.query(SysDept).filter(SysDept.id == id).first()
            if dept:
                for key, value in kwargs.items():
                    setattr(dept, key, value)
                session.commit()
            return dept

    def delete(self, id: int) -> bool:
        with self.session() as session:
            dept = session.query(SysDept).filter(SysDept.id == id).first()
            if dept:
                dept.is_active = False
                session.commit()
                return True
            return False