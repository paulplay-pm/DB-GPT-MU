from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Integer, DateTime
from dbgpt.storage.metadata import Model


class SysRegistration(Model):
    """Registration application entity"""

    __tablename__ = "sys_user_registration"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    login_name = Column(String(64), nullable=False, unique=True)
    password_hash = Column(String(256), nullable=False)
    real_name = Column(String(128), nullable=True)
    email = Column(String(128), nullable=True)
    dept_id = Column(BigInteger, nullable=True)
    status = Column(String(16), default="pending")  # pending, approved, rejected
    reject_reason = Column(String(256), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)