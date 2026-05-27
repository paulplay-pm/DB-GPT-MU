from datetime import datetime
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Boolean

from dbgpt.storage.metadata import Model


class SysUser(Model):
    """System user entity - mirrors the sys_user table"""

    __tablename__ = "sys_user"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(String(64), nullable=False, unique=True)  # 关联其他模块
    login_name = Column(String(64), nullable=False, unique=True)  # 登录名
    password_hash = Column(String(256), nullable=False)  # bcrypt hash
    real_name = Column(String(128), nullable=True)
    email = Column(String(128), nullable=True)
    phone = Column(String(32), nullable=True)  # 手机号
    dept_id = Column(BigInteger, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_super_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)