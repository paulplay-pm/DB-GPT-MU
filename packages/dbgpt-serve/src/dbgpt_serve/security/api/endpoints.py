from fastapi import APIRouter
from .auth_endpoints import router as auth_router
from .dept_endpoints import router as dept_router
from .permission_endpoints import router as permission_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["认证"])
router.include_router(dept_router, prefix="", tags=["部门管理"])
router.include_router(permission_router, prefix="", tags=["权限管理"])


def init_endpoints(system_app, config):
    """Initialize endpoints - called by serve.py"""
    pass


# Re-export middleware for convenience
from ..middleware import get_current_user_from_request, require_permission

__all__ = ["router", "init_endpoints", "get_current_user_from_request", "require_permission"]