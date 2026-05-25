from fastapi import APIRouter, HTTPException
from typing import List
from .schemas import RoleResponse, RoleCreateRequest, RoleUpdateRequest
from ..service.role_service import SysRoleService
from ...core import Result

router = APIRouter()


@router.get("/roles", response_model=Result[List[RoleResponse]])
async def list_roles():
    """List all active roles"""
    service = SysRoleService()
    roles = service.list_roles()
    return Result.succ(roles)


@router.get("/roles/{role_id}", response_model=Result)
async def get_role(role_id: int):
    """Get role by ID"""
    service = SysRoleService()
    role = service.get_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return Result.succ(role)


@router.post("/roles", response_model=Result)
async def create_role(request: RoleCreateRequest):
    """Create new role"""
    service = SysRoleService()
    # Check if role code already exists
    existing = service.get_by_code(request.code)
    if existing:
        raise HTTPException(status_code=400, detail="Role code already exists")
    role = service.create_role(**request.dict())
    return Result.succ({"id": role.id})


@router.put("/roles/{role_id}", response_model=Result)
async def update_role(role_id: int, request: RoleUpdateRequest):
    """Update role"""
    service = SysRoleService()
    role = service.update_role(role_id, **request.dict(exclude_unset=True))
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return Result.succ(None)


@router.delete("/roles/{role_id}", response_model=Result)
async def delete_role(role_id: int):
    """Delete (deactivate) role"""
    service = SysRoleService()
    success = service.delete_role(role_id)
    if not success:
        raise HTTPException(status_code=404, detail="Role not found")
    return Result.succ(None)


@router.put("/roles/{role_id}/permissions", response_model=Result)
async def update_role_permissions(role_id: int, permission_ids: List[int]):
    """Update role's permissions (replace all)"""
    from ..service.permission_service import SysPermissionService

    service = SysPermissionService()
    service.update_role_permissions(role_id, permission_ids)
    return Result.succ(None)