from fastapi import APIRouter
from typing import List
from .schemas import PermissionTreeResponse
from ..service.permission_service import SysPermissionService
from ...core import Result

router = APIRouter()


@router.get("/permissions", response_model=Result[List[PermissionTreeResponse]])
async def list_permissions():
    """Get all permissions (tree structure) - read only, no create/update/delete"""
    service = SysPermissionService()
    tree = service.get_all_permissions_tree()
    return Result.succ(tree)