"""Security DAO module."""
from .user_dao import SysUserDao
from .permission_dao import SysPermissionDao

__all__ = ["SysUserDao", "SysPermissionDao"]