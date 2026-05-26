import json
from fastapi import APIRouter, HTTPException, Response, Request
from .schemas import LoginRequest, LoginResponse, CurrentUserResponse, ProfileUpdateRequest, PasswordChangeRequest
from ..service.auth_service import AuthService
from ...core import Result

router = APIRouter()
auth_service = AuthService()


def create_session(response: Response, user_data: dict):
    """Create session cookie after successful login"""
    response.set_cookie(
        key="session",
        value=json.dumps(user_data),
        httponly=True,
        max_age=86400 * 7,  # 7 days
        samesite="lax"
    )


@router.post("/login", response_model=Result[LoginResponse])
async def login(request: LoginRequest, response: Response):
    """
    Login endpoint - POST /api/v2/sys/login

    Request body:
    - login_name: str
    - password: str

    Returns user info with permissions on success.
    Sets session cookie on success.
    """
    user, error = auth_service.authenticate(request.login_name, request.password)
    if error:
        raise HTTPException(status_code=401, detail=error)

    # Permissions are already calculated in AuthService.authenticate() via PermissionService
    create_session(response, user)
    return Result.succ(LoginResponse(**user))


@router.post("/logout", response_model=Result)
async def logout(request: Request, response: Response):
    """Logout endpoint - clears session cookie"""
    response.delete_cookie("session")
    return Result.succ(None)


@router.get("/me", response_model=Result[CurrentUserResponse])
async def get_current_user(request: Request):
    """Get current logged in user info"""
    session_data = request.cookies.get("session")
    if not session_data:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_data = json.loads(session_data)
    return Result.succ(CurrentUserResponse(**user_data))


@router.put("/profile", response_model=Result[CurrentUserResponse])
async def update_profile(request: Request, body: ProfileUpdateRequest):
    """Update current user's profile"""
    session_data = request.cookies.get("session")
    if not session_data:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_data = json.loads(session_data)
    updated_user, error = auth_service.update_profile(
        user_id=user_data["id"],
        real_name=body.real_name,
        email=body.email,
        dept_id=body.dept_id,
    )
    if error:
        raise HTTPException(status_code=400, detail=error)
    return Result.succ(CurrentUserResponse(**updated_user))


@router.put("/password", response_model=Result)
async def change_password(request: Request, body: PasswordChangeRequest):
    """Change current user's password"""
    session_data = request.cookies.get("session")
    if not session_data:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_data = json.loads(session_data)
    success, error = auth_service.change_password(
        user_id=user_data["id"],
        old_password=body.old_password,
        new_password=body.new_password,
    )
    if not success:
        raise HTTPException(status_code=400, detail=error)
    return Result.succ(None)