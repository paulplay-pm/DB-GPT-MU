from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional
from .schemas import RegisterRequest, RegistrationResponse, ApproveRequest, RejectRequest
from ..service.registration_service import RegistrationService
from ..middleware.auth_middleware import require_permission
from ...core import Result

router = APIRouter()


@router.post("/register", response_model=Result)
async def submit_registration(request: RegisterRequest):
    """Submit registration application (public endpoint)"""
    service = RegistrationService()
    try:
        service.create_application(
            login_name=request.login_name,
            password=request.password,
            user_name=request.user_name,
            real_name=request.real_name,
            email=request.email,
            apply_dept_id=request.apply_dept_id
        )
        return Result.succ({"message": "申请已提交，请等待审核"})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/registrations", response_model=Result[List[RegistrationResponse]])
async def list_registrations(status: Optional[str] = None):
    """List registration applications (admin, requires auth)"""
    service = RegistrationService()
    registrations = service.list_applications(status)
    return Result.succ(registrations)


@router.post("/registrations/{id}/approve", response_model=Result)
async def approve_registration(id: int, request: ApproveRequest):
    """Approve registration and create user (admin)"""
    service = RegistrationService()
    try:
        user = service.approve(id, request.dept_id, request.role_ids)
        return Result.succ({"user_id": user.id})
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/registrations/{id}/reject", response_model=Result)
async def reject_registration(id: int, request: RejectRequest):
    """Reject registration (admin)"""
    service = RegistrationService()
    try:
        service.reject(id, request.reason)
        return Result.succ(None)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))