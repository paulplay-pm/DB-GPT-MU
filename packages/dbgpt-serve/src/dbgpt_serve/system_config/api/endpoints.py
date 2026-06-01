"""System config API endpoints."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.security.http import HTTPBearer

from dbgpt.component import SystemApp
from dbgpt_serve.core import Result, blocking_func_to_async

from .schemas import (
    BrandConfigResponse,
    BrandConfigUpdateRequest,
)
from ..config import SERVE_SERVICE_COMPONENT_NAME, ServeConfig
from ..service.brand_service import ConfigService, SERVE_SERVICE_COMPONENT_NAME as SERVICE_NAME

logger = logging.getLogger(__name__)

router = APIRouter()

global_system_app: Optional[SystemApp] = None

# Authentication disabled for now - add admin role check in production
get_bearer_token = HTTPBearer(auto_error=False)


def get_service() -> ConfigService:
    """Get the service instance."""
    return global_system_app.get_component(SERVICE_NAME, ConfigService)


async def check_admin_role(
    auth: Optional[str] = Depends(get_bearer_token),
    service: ConfigService = Depends(get_service),
) -> str:
    """Check if user has admin role."""
    # TODO: Implement actual admin role check
    # For now, allow all authenticated users
    return "admin"


@router.get("/brand", response_model=Result[BrandConfigResponse])
async def get_brand_config(
    service: ConfigService = Depends(get_service),
) -> Result[BrandConfigResponse]:
    """Get brand configuration."""
    res = await blocking_func_to_async(global_system_app, service.get_brand_config)
    return Result.succ(BrandConfigResponse(**res))


@router.put("/brand", response_model=Result[BrandConfigResponse])
async def update_brand_config(
    request: BrandConfigUpdateRequest,
    service: ConfigService = Depends(get_service),
) -> Result[BrandConfigResponse]:
    """Update brand configuration."""
    res = await blocking_func_to_async(global_system_app, service.update_brand_config, request.model_dump(exclude_none=True))
    return Result.succ(BrandConfigResponse(**res))


@router.post("/logo", response_model=Result[dict])
async def upload_logo(
    file: UploadFile = File(...),
    service: ConfigService = Depends(get_service),
) -> Result[dict]:
    """Upload logo file."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    content = await file.read()
    try:
        logo_url = await blocking_func_to_async(
            global_system_app, service.upload_logo, content, file.filename
        )
        return Result.succ({"logo_url": logo_url})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logo upload failed: {e}")
        raise HTTPException(status_code=500, detail="Logo upload failed")


def init_endpoints(system_app: SystemApp, config: ServeConfig) -> None:
    """Initialize the endpoints."""
    global global_system_app
    system_app.register(ConfigService)
    global_system_app = system_app