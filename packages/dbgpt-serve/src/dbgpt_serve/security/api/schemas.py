from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List


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


class ProfileUpdateRequest(BaseModel):
    """Update profile request"""
    real_name: Optional[str] = None
    email: Optional[str] = None
    dept_id: Optional[int] = None


class PasswordChangeRequest(BaseModel):
    """Change password request"""
    old_password: str
    new_password: str


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


class RoleResponse(BaseModel):
    """Role response schema"""
    id: int
    code: str
    name: str
    description: Optional[str]
    is_active: bool


class RoleCreateRequest(BaseModel):
    """Create role request"""
    code: str
    name: str
    description: Optional[str] = None


class RoleUpdateRequest(BaseModel):
    """Update role request"""
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None


class UserResponse(BaseModel):
    """User response schema"""
    id: int
    user_id: str
    login_name: str
    real_name: Optional[str]
    email: Optional[str]
    dept_id: Optional[int]
    is_active: bool
    is_super_admin: bool


class UserCreateRequest(BaseModel):
    """Create user request"""
    user_id: str
    login_name: str
    password: str
    real_name: Optional[str] = None
    email: Optional[str] = None
    dept_id: Optional[int] = None


class UserUpdateRequest(BaseModel):
    """Update user request"""
    real_name: Optional[str] = None
    email: Optional[str] = None
    dept_id: Optional[int] = None
    is_active: Optional[bool] = None


class RegisterRequest(BaseModel):
    """Registration request schema"""
    login_name: str
    password: str
    real_name: Optional[str] = None
    email: Optional[str] = None
    dept_id: Optional[int] = None


class RegistrationResponse(BaseModel):
    """Registration response schema"""
    id: int
    login_name: str
    real_name: Optional[str]
    email: Optional[str]
    dept_id: Optional[int]
    status: str
    reject_reason: Optional[str]
    created_at: datetime


class ApproveRequest(BaseModel):
    """Approve registration request"""
    dept_id: Optional[int] = None
    role_ids: Optional[List[int]] = None


class RejectRequest(BaseModel):
    """Reject registration request"""
    reason: str