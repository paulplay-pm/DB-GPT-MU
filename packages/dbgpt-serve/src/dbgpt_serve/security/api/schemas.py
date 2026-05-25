from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    """Login request schema"""
    login_name: str
    password: str


class LoginResponse(BaseModel):
    """Login response schema"""
    id: int
    user_id: str
    login_name: str
    real_name: Optional[str]
    email: Optional[str]
    is_super_admin: bool
    permissions: list[str] = []  # permission codes


class CurrentUserResponse(BaseModel):
    """Current user info response"""
    id: int
    user_id: str
    login_name: str
    real_name: Optional[str]
    email: Optional[str]
    dept_id: Optional[int]
    is_super_admin: bool
    permissions: list[str] = []


class DeptTreeResponse(BaseModel):
    """Department tree response"""
    id: int
    code: str
    name: str
    parent_id: Optional[int]
    level: int
    sort: int
    children: list = []


class DeptCreateRequest(BaseModel):
    """Create department request"""
    code: str
    name: str
    parent_id: Optional[int] = None
    level: int = 1
    sort: int = 0


class DeptUpdateRequest(BaseModel):
    """Update department request"""
    code: Optional[str] = None
    name: Optional[str] = None
    parent_id: Optional[int] = None
    level: Optional[int] = None
    sort: Optional[int] = None


class PermissionTreeResponse(BaseModel):
    """Permission tree response"""
    id: int
    code: str
    name: str
    parent_id: Optional[int]
    level: int
    sort: int
    children: list = []