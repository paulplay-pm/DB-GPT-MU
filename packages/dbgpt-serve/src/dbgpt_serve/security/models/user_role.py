from sqlalchemy import Column, BigInteger, ForeignKey
from dbgpt.storage.metadata import Model


class SysUserRole(Model):
    """User-Role association table - mirrors the sys_user_role table"""

    __tablename__ = "sys_user_role"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("sys_user.id"), nullable=False)
    role_id = Column(BigInteger, ForeignKey("sys_role.id"), nullable=False)