from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPCookie
from typing import Optional
import json


security = HTTPBearer(auto_error=False)
cookie_auth = HTTPCookie()


async def get_current_user_from_request(request: Request) -> dict:
    """
    Extract current user from request cookie or header.
    Raises 401 if not authenticated.
    """
    # 优先从 cookie 获取 session
    session_cookie = request.cookies.get("session")
    if session_cookie:
        try:
            return json.loads(session_cookie)
        except json.JSONDecodeError:
            pass

    # Fallback: 从 Authorization header 获取 Bearer token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            return json.loads(token)  # 简单实现: token 直接是 JSON
        except json.JSONDecodeError:
            pass

    raise HTTPException(status_code=401, detail="Not authenticated")


async def require_permission(request: Request, required_permission: str):
    """
    Check if current user has the required permission.
    Super admin bypasses all permission checks.
    Raises 403 if not authorized.
    """
    user = await get_current_user_from_request(request)

    if user.get("is_super_admin"):
        return user

    user_permissions = user.get("permissions", [])
    if required_permission not in user_permissions:
        raise HTTPException(status_code=403, detail="Permission denied")

    return user