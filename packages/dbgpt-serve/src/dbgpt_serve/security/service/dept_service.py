from typing import Optional, List
from ..dao.dept_dao import SysDeptDao
from ..models.dept import SysDept


class SysDeptService:
    """Service for sys_dept operations"""

    def __init__(self):
        self._dao = SysDeptDao()

    def get_by_id(self, id: int) -> Optional[SysDept]:
        return self._dao.get_by_id(id)

    def list_depts(self) -> List[SysDept]:
        return self._dao.get_all()

    def get_tree(self) -> List[dict]:
        """Get department tree structure"""
        all_depts = self._dao.get_all()
        return self._build_tree(all_depts, None)

    def _build_tree(self, depts: List[SysDept], parent_id: Optional[int]) -> List[dict]:
        result = []
        for dept in depts:
            if dept.parent_id == parent_id:
                node = {
                    "id": dept.id,
                    "code": dept.code,
                    "name": dept.name,
                    "parent_id": dept.parent_id,
                    "level": dept.level,
                    "sort": dept.sort,
                    "children": self._build_tree(depts, dept.id)
                }
                result.append(node)
        return result

    def create_dept(self, **kwargs) -> SysDept:
        return self._dao.create(**kwargs)

    def update_dept(self, id: int, **kwargs) -> Optional[SysDept]:
        return self._dao.update(id, **kwargs)

    def delete_dept(self, id: int) -> bool:
        return self._dao.delete(id)