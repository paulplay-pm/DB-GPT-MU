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