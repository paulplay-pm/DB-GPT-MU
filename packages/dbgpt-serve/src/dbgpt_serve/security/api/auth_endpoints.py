import json
from fastapi import APIRouter, HTTPException, Response, Request
from .schemas import LoginRequest, LoginResponse, CurrentUserResponse
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