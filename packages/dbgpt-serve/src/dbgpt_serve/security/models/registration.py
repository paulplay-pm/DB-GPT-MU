from sqlalchemy import Column, BigInteger, String, DateTime
from dbgpt.storage.metadata import Model


class SysRegistration(Model):
    """Registration application entity"""

    __tablename__ = "sys_user_registration"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_name = Column(String(64), nullable=False)  # 申请人姓名
    login_name = Column(String(64), nullable=False, unique=True)  # 申请登录名
    password_hash = Column(String(256), nullable=False)  # bcrypt加密密码
    real_name = Column(String(128), nullable=True)  # 真实姓名
    email = Column(String(128), nullable=True)  # 邮箱
    phone = Column(String(32), nullable=True)  # 手机号
    apply_dept_id = Column(BigInteger, nullable=True)  # 申请部门ID
    status = Column(String(32), default="pending")  # pending, approved, rejected
    apply_time = Column(DateTime, nullable=True)  # 申请时间
    approved_by = Column(BigInteger, nullable=True)  # 审核人用户ID
    approved_time = Column(DateTime, nullable=True)  # 审核时间
    approved_dept_id = Column(BigInteger, nullable=True)  # 审核分配的部门ID
    reject_reason = Column(String(512), nullable=True)  # 拒绝原因