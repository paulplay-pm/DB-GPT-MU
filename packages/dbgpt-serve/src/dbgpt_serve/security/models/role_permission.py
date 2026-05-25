from sqlalchemy import Column, BigInteger, ForeignKey
from dbgpt.storage.metadata import Model


class SysRolePermission(Model):
    """Role-Permission association table - mirrors the sys_role_permission table"""

    __tablename__ = "sys_role_permission"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    role_id = Column(BigInteger, ForeignKey("sys_role.id"), nullable=False)
    permission_id = Column(BigInteger, ForeignKey("sys_permission.id"), nullable=False)
