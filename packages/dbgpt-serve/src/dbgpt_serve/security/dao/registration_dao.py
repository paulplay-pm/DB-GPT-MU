from typing import Optional, List
from dbgpt.storage.metadata import BaseDao
from ..models.registration import SysRegistration


class SysRegistrationDao(BaseDao):
    """DAO for sys_registration table"""

    def get_by_id(self, id: int) -> Optional[SysRegistration]:
        with self.session() as session:
            return session.query(SysRegistration).filter(
                SysRegistration.id == id
            ).first()

    def get_by_login_name(self, login_name: str) -> Optional[SysRegistration]:
        with self.session() as session:
            return session.query(SysRegistration).filter(
                SysRegistration.login_name == login_name
            ).first()

    def get_by_status(self, status: str) -> List[SysRegistration]:
        with self.session() as session:
            return session.query(SysRegistration).filter(
                SysRegistration.status == status
            ).all()

    def get_all(self) -> List[SysRegistration]:
        with self.session() as session:
            return session.query(SysRegistration).order_by(
                SysRegistration.created_at.desc()
            ).all()

    def create(self, **kwargs) -> SysRegistration:
        with self.session() as session:
            reg = SysRegistration(**kwargs)
            session.add(reg)
            return reg

    def update_status(self, id: int, status: str, reject_reason: str = None) -> bool:
        with self.session() as session:
            reg = session.query(SysRegistration).filter(
                SysRegistration.id == id
            ).first()
            if reg:
                reg.status = status
                if reject_reason:
                    reg.reject_reason = reject_reason
                return True
            return False