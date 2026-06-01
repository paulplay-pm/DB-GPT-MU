"""System config API module."""

from .endpoints import router
from .schemas import BrandConfigResponse, BrandConfigUpdateRequest

__ALL__ = ["router", "BrandConfigResponse", "BrandConfigUpdateRequest"]