"""Tests for category CRUD operations."""

import pytest
from fastapi import FastAPI
from httpx import AsyncClient

from dbgpt.component import SystemApp
from dbgpt.storage.metadata import db
from dbgpt_serve.core import BaseServeConfig
from dbgpt_serve.core.tests.conftest import (  # noqa: F401
    asystem_app,
    client,
    config,
    system_app,
)
from dbgpt_serve.conversation.api.category_endpoints import (
    init_category_endpoints,
    router as category_router,
)
from dbgpt_serve.conversation.api.endpoints import init_endpoints, router
from dbgpt_serve.conversation.config import SERVE_CONFIG_KEY_PREFIX
from dbgpt_serve.conversation.category_service import CategoryService


@pytest.fixture(autouse=True)
def setup_and_teardown():
    db.init_db("sqlite:///:memory:")
    db.create_all()
    yield


def client_init_caller(app: FastAPI, system_app: SystemApp, config: BaseServeConfig):
    app.include_router(router)
    app.include_router(category_router)
    init_endpoints(system_app, config)
    init_category_endpoints(system_app, config)


# Test CategoryService directly
class TestCategoryService:
    """Test CategoryService business logic."""

    def test_create_category(self):
        """Test creating a new category."""
        service = CategoryService()
        result = service.create_category(
            user_name="test_user",
            name="Test Category",
            color="#3B82F6"
        )
        assert result["name"] == "Test Category"
        assert result["color"] == "#3B82F6"
        assert result["user_name"] == "test_user"
        assert "category_id" in result

    def test_get_user_categories(self):
        """Test getting all categories for a user."""
        service = CategoryService()

        # Create some categories
        service.create_category("user1", "Category 1", "#3B82F6")
        service.create_category("user1", "Category 2", "#10B981")
        service.create_category("user2", "Category 3", "#8B5CF6")

        # Get categories for user1
        categories = service.get_user_categories("user1")
        assert len(categories) == 2
        assert all(c["user_name"] == "user1" for c in categories)

    def test_rename_category(self):
        """Test renaming a category."""
        service = CategoryService()

        # Create a category
        created = service.create_category("user1", "Original Name", "#3B82F6")
        category_id = created["category_id"]

        # Rename it
        renamed = service.rename_category(category_id, "user1", "New Name")
        assert renamed["name"] == "New Name"

    def test_rename_category_wrong_user(self):
        """Test that renaming with wrong user returns None."""
        service = CategoryService()

        # Create a category
        created = service.create_category("user1", "Original Name", "#3B82F6")
        category_id = created["category_id"]

        # Try to rename with different user
        result = service.rename_category(category_id, "user2", "New Name")
        assert result is None

    def test_delete_category(self):
        """Test deleting a category."""
        service = CategoryService()

        # Create a category
        created = service.create_category("user1", "To Delete", "#3B82F6")
        category_id = created["category_id"]

        # Delete it
        success = service.delete_category(category_id, "user1")
        assert success is True

        # Verify it's gone
        categories = service.get_user_categories("user1")
        assert len(categories) == 0

    def test_delete_category_wrong_user(self):
        """Test that deleting with wrong user returns False."""
        service = CategoryService()

        # Create a category
        created = service.create_category("user1", "To Delete", "#3B82F6")
        category_id = created["category_id"]

        # Try to delete with different user
        success = service.delete_category(category_id, "user2")
        assert success is False

        # Verify it's still there
        categories = service.get_user_categories("user1")
        assert len(categories) == 1


# API endpoint tests
@pytest.mark.asyncio
@pytest.mark.parametrize(
    "client",
    [{"app_caller": client_init_caller}],
    indirect=["client"],
)
async def test_create_category_endpoint(client: AsyncClient):
    """Test POST /conversation/category/create endpoint."""
    response = await client.post(
        "/conversation/category/create",
        json={"user_name": "test_user", "name": "API Test Category", "color": "#EF4444"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "API Test Category"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "client",
    [{"app_caller": client_init_caller}],
    indirect=["client"],
)
async def test_list_categories_endpoint(client: AsyncClient):
    """Test GET /conversation/category/list endpoint."""
    # Create a category first
    await client.post(
        "/conversation/category/create",
        json={"user_name": "list_user", "name": "List Test", "color": "#10B981"}
    )

    # List categories
    response = await client.get("/conversation/category/list?user_name=list_user")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) >= 1


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "client",
    [{"app_caller": client_init_caller}],
    indirect=["client"],
)
async def test_rename_category_endpoint(client: AsyncClient):
    """Test PUT /conversation/category/{id}/rename endpoint."""
    # Create a category
    create_resp = await client.post(
        "/conversation/category/create",
        json={"user_name": "rename_user", "name": "Old Name", "color": "#3B82F6"}
    )
    category_id = create_resp.json()["data"]["category_id"]

    # Rename it
    response = await client.put(
        f"/conversation/category/{category_id}/rename?user_name=rename_user",
        json={"name": "New Name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["name"] == "New Name"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "client",
    [{"app_caller": client_init_caller}],
    indirect=["client"],
)
async def test_delete_category_endpoint(client: AsyncClient):
    """Test DELETE /conversation/category/{id} endpoint."""
    # Create a category
    create_resp = await client.post(
        "/conversation/category/create",
        json={"user_name": "delete_user", "name": "To Delete", "color": "#EF4444"}
    )
    category_id = create_resp.json()["data"]["category_id"]

    # Delete it
    response = await client.delete(
        f"/conversation/category/{category_id}?user_name=delete_user"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
