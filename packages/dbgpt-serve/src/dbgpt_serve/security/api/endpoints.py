from fastapi import APIRouter
from .auth_endpoints import router as auth_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["认证"])


def init_endpoints(system_app, config):
    """Initialize endpoints - called by serve.py"""
    pass


# Re-export middleware for convenience
from ..middleware import get_current_user_from_request, require_permission

__all__ = ["router", "init_endpoints", "get_current_user_from_request", "require_permission"]