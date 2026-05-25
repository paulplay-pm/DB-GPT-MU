from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Integer, Boolean, DateTime
from dbgpt.storage.metadata import Model


class SysRole(Model):
    """System role entity - mirrors the sys_role table"""

    __tablename__ = "sys_role"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(64), nullable=False, unique=True)  # Role code like "admin"
    name = Column(String(128), nullable=False)  # Role name
    description = Column(String(256), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)