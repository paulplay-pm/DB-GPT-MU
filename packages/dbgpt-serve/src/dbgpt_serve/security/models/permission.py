from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Integer, DateTime
from dbgpt.storage.metadata import Model


class SysPermission(Model):
    """System permission entity - mirrors the sys_permission table"""

    __tablename__ = "sys_permission"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(128), nullable=False, unique=True)  # Permission code like "user.view"
    name = Column(String(128), nullable=False)  # Permission name
    parent_id = Column(BigInteger, nullable=True)  # Parent permission for grouping
    level = Column(Integer, default=1)
    sort = Column(Integer, default=0)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)