from fastapi import APIRouter, HTTPException
from typing import List
from .schemas import UserResponse, UserCreateRequest, UserUpdateRequest
from ..service.user_service import SysUserService
from ..service.permission_service import SysPermissionService
from ...core import Result

router = APIRouter()


@router.get("/users", response_model=Result[List[UserResponse]])
async def list_users():
    """List all users"""
    service = SysUserService()
    users = service.get_all()
    return Result.succ(users)


@router.get("/users/{user_id}", response_model=Result)
async def get_user(user_id: int):
    """Get user by ID"""
    service = SysUserService()
    user = service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return Result.succ(user)


@router.post("/users", response_model=Result)
async def create_user(request: UserCreateRequest):
    """Create new user"""
    service = SysUserService()
    user = service.create_user(**request.dict())
    return Result.succ({"id": user.id})


@router.put("/users/{user_id}", response_model=Result)
async def update_user(user_id: int, request: UserUpdateRequest):
    """Update user"""
    service = SysUserService()
    user = service.update_user(user_id, **request.dict(exclude_unset=True))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return Result.succ(None)


@router.put("/users/{user_id}/roles", response_model=Result)
async def update_user_roles(user_id: int, role_ids: List[int]):
    """Update user's roles"""
    service = SysUserService()
    service.update_user_roles(user_id, role_ids)
    return Result.succ(None)


@router.get("/users/{user_id}/permissions", response_model=Result[List[str]])
async def get_user_permissions(user_id: int):
    """Get user's effective permissions"""
    permission_service = SysPermissionService()
    permissions = permission_service.get_user_permissions(user_id)
    return Result.succ(permissions)


@router.get("/users/{user_id}/roles", response_model=Result[List[int]])
async def get_user_roles(user_id: int):
    """Get user's role IDs"""
    service = SysUserService()
    roles = service.get_user_roles(user_id)
    return Result.succ(roles)