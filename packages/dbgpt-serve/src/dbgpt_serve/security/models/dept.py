from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Integer, Boolean, DateTime, ForeignKey

from dbgpt.storage.metadata import Model


class SysDept(Model):
    """System department entity - mirrors the sys_dept table"""

    __tablename__ = "sys_dept"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(64), nullable=False)
    name = Column(String(128), nullable=False)
    parent_id = Column(BigInteger, ForeignKey("sys_dept.id"), nullable=True)
    level = Column(Integer, default=1)
    sort = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)