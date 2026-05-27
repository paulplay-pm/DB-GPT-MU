from typing import Optional, List
from dbgpt.storage.metadata import BaseDao
from ..models.dept import SysDept


class SysDeptDao(BaseDao):
    """DAO for sys_dept table"""

    def get_by_id(self, id: int) -> Optional[SysDept]:
        with self.session() as session:
            dept = session.query(SysDept).filter(SysDept.id == id).first()
            if dept:
                session.expunge(dept)
            return dept

    def get_all(self) -> List[SysDept]:
        with self.session() as session:
            depts = session.query(SysDept).filter(SysDept.is_active == True).all()
            for dept in depts:
                session.expunge(dept)
            return depts

    def get_children(self, parent_id: int) -> List[SysDept]:
        with self.session() as session:
            depts = session.query(SysDept).filter(
                SysDept.parent_id == parent_id,
                SysDept.is_active == True
            ).all()
            for dept in depts:
                session.expunge(dept)
            return depts

    def create(self, **kwargs) -> SysDept:
        with self.session() as session:
            dept = SysDept(**kwargs)
            session.add(dept)
            session.flush()
            session.refresh(dept)
            session.expunge(dept)
            return dept

    def update(self, id: int, **kwargs) -> Optional[SysDept]:
        with self.session() as session:
            dept = session.query(SysDept).filter(SysDept.id == id).first()
            if dept:
                for key, value in kwargs.items():
                    setattr(dept, key, value)
                session.commit()
                session.expunge(dept)
            return dept

    def delete(self, id: int) -> bool:
        with self.session() as session:
            dept = session.query(SysDept).filter(SysDept.id == id).first()
            if dept:
                dept.is_active = False
                session.commit()
                return True
            return False