from fastapi import APIRouter, HTTPException, Request
from typing import List
from .schemas import DeptTreeResponse, DeptCreateRequest, DeptUpdateRequest
from ..service.dept_service import SysDeptService
from ..middleware.auth_middleware import require_permission
from ...core import Result

router = APIRouter()


@router.get("/depts", response_model=Result[List[DeptTreeResponse]])
async def list_depts(request: Request):
    """List all departments (tree structure)"""
    service = SysDeptService()
    tree = service.get_tree()
    return Result.succ(tree)


@router.get("/depts/{dept_id}", response_model=Result)
async def get_dept(dept_id: int):
    """Get department by ID"""
    service = SysDeptService()
    dept = service.get_by_id(dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return Result.succ({
        "id": dept.id,
        "code": dept.code,
        "name": dept.name,
        "parent_id": dept.parent_id,
        "level": dept.level,
        "sort": dept.sort,
    })


@router.post("/depts", response_model=Result)
async def create_dept(request: DeptCreateRequest):
    """Create new department"""
    service = SysDeptService()
    dept = service.create_dept(**request.dict())
    return Result.succ({"id": dept.id})


@router.put("/depts/{dept_id}", response_model=Result)
async def update_dept(dept_id: int, request: DeptUpdateRequest):
    """Update department"""
    service = SysDeptService()
    dept = service.update_dept(dept_id, **request.dict(exclude_unset=True))
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return Result.succ(None)


@router.delete("/depts/{dept_id}", response_model=Result)
async def delete_dept(dept_id: int):
    """Delete (deactivate) department"""
    service = SysDeptService()
    success = service.delete_dept(dept_id)
    if not success:
        raise HTTPException(status_code=404, detail="Department not found")
    return Result.succ(None)