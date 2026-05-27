from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Integer, DateTime
from dbgpt.storage.metadata import Model


class SysPermission(Model):
    """System permission entity - mirrors the sys_permission table"""

    __tablename__ = "sys_permission"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(128), nullable=False, unique=True)  # Permission code like "user.view"
    name = Column(String(128), nullable=False)  # Permission name
    parent_code = Column(String(128), nullable=True)  # Parent permission code for grouping
    perm_type = Column(String(32), default='menu')  # Type: menu/button/api
    sort = Column(Integer, default=0)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.now)