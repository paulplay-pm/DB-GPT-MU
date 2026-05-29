"""Category API endpoints."""

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from dbgpt.component import SystemApp
from dbgpt_serve.core import Result

from ..category_service import CategoryService
from ..config import ServeConfig
from ..service.service import Service

router = APIRouter(prefix="/conversation/category", tags=["category"])

global_system_app: Optional[SystemApp] = None
_category_service: Optional[CategoryService] = None


def get_service() -> Service:
    """Get the conversation service instance"""
    return global_system_app.get_component(
        "dbgpt_serve.conversation.service.service.Service", Service
    )


def get_category_service() -> CategoryService:
    """Get the category service instance"""
    global _category_service
    if _category_service is None:
        _category_service = CategoryService()
    return _category_service


class CreateCategoryRequest(BaseModel):
    """Request model for creating a category."""

    user_name: str = Field(..., description="User identifier")
    name: str = Field(..., max_length=50, description="Category name")
    color: str = Field(default="#3B82F6", description="Category color")


class RenameCategoryRequest(BaseModel):
    """Request model for renaming a category."""

    name: str = Field(..., max_length=50, description="New category name")


class MoveConversationsRequest(BaseModel):
    """Request model for moving conversations to a category."""

    conv_uids: List[str] = Field(..., description="List of conversation UIDs")
    category_id: Optional[int] = Field(
        default=None, description="Target category id (null for uncategorized)"
    )


class CategoryResponse(BaseModel):
    """Response model for a category."""

    category_id: int = Field(..., description="Category id")
    user_name: str = Field(..., description="User identifier")
    name: str = Field(..., description="Category name")
    color: str = Field(..., description="Category color")
    gmt_created: Optional[str] = Field(None, description="Creation time")


@router.post("/create", response_model=Result[CategoryResponse])
async def create_category(request: CreateCategoryRequest):
    """Create a new category."""
    service = get_category_service()
    category = service.create_category(
        user_name=request.user_name, name=request.name, color=request.color
    )
    return Result.succ(CategoryResponse(**category))


@router.put("/{category_id}/rename", response_model=Result[CategoryResponse])
async def rename_category(
    category_id: int,
    request: RenameCategoryRequest,
    user_name: str = Query(..., description="User identifier"),
):
    """Rename a category."""
    service = get_category_service()
    category = service.rename_category(
        category_id=category_id, user_name=user_name, name=request.name
    )
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found or not authorized")
    return Result.succ(CategoryResponse(**category))


@router.delete("/{category_id}", response_model=Result[bool])
async def delete_category(
    category_id: int,
    user_name: str = Query(..., description="User identifier"),
):
    """Delete a category."""
    service = get_category_service()
    success = service.delete_category(category_id=category_id, user_name=user_name)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found or not authorized")
    return Result.succ(True)


@router.get("/list", response_model=Result[List[CategoryResponse]])
async def list_categories(
    user_name: str = Query(..., description="User identifier"),
):
    """Get all categories for a user."""
    service = get_category_service()
    categories = service.get_user_categories(user_name=user_name)
    return Result.succ([CategoryResponse(**c) for c in categories])


@router.post("/move", response_model=Result[int])
async def move_conversations(
    request: MoveConversationsRequest,
    user_name: str = Query(..., description="User identifier"),
):
    """Move conversations to a category."""
    if not request.conv_uids:
        raise HTTPException(status_code=400, detail="conv_uids cannot be empty")

    service = get_category_service()
    count = service.move_conversations(
        conv_uids=request.conv_uids,
        category_id=request.category_id,
        user_name=user_name,
    )
    return Result.succ(count)


@router.get("/counts", response_model=Result[dict])
async def get_category_counts(
    user_name: str = Query(..., description="User identifier"),
):
    """Get conversation counts per category."""
    service = get_category_service()
    counts = service.get_category_counts(user_name=user_name)
    return Result.succ(counts)


def init_category_endpoints(system_app: SystemApp, config: ServeConfig) -> None:
    """Initialize the category endpoints."""
    global global_system_app
    global_system_app = system_app