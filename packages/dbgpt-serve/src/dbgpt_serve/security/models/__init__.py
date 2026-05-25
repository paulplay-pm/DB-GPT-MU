"""Security models module."""
from .user import SysUser
from .permission import SysPermission

__all__ = ["SysUser", "SysPermission"]