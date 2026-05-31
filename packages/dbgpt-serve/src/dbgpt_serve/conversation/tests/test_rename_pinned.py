"""Test that rename preserves is_pinned status via API endpoint."""
import pytest
from fastapi import FastAPI
from httpx import AsyncClient

from dbgpt.component import SystemApp
from dbgpt.storage.metadata import db
from dbgpt_serve.core import BaseServeConfig
from dbgpt_serve.core.tests.conftest import (
    asystem_app,
    client,
    config,
    system_app,
)

from ..api.endpoints import init_endpoints, router
from ..config import SERVE_CONFIG_KEY_PREFIX


@pytest.fixture(autouse=True)
def setup_and_teardown():
    db.init_db("sqlite:///:memory:")
    db.create_all()
    yield


def client_init_caller(app: FastAPI, system_app: SystemApp, config: BaseServeConfig):
    app.include_router(router)
    init_endpoints(system_app, config)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "client, asystem_app",
    [
        (
            {
                "app_caller": client_init_caller,
                "client_api_key": "test_token1",
            },
            {
                "app_config": {
                    f"{SERVE_CONFIG_KEY_PREFIX}api_keys": "test_token1,test_token2"
                }
            },
        ),
    ],
    indirect=["client", "asystem_app"],
)
async def test_rename_preserves_pinned_status(client: AsyncClient, asystem_app):
    """Test that renaming a pinned conversation preserves its pinned status."""
    # Step 1: Create a conversation
    # Note: In test context, router is included without prefix, so use /new not /api/v1/chat/dialogue/new
    # Auth: conftest's config fixture has api_keys = "mock_api_key_123"
    create_resp = await client.post(
        "/new",
        params={
            "conv_uid": "test-conv-pinned",
            "chat_mode": "chat_normal",
            "user_name": "test_user",
        },
        headers={"Authorization": "Bearer mock_api_key_123"},
    )
    print(f"Create response: {create_resp.status_code} {create_resp.json()}")
    assert create_resp.status_code == 200

    # Step 2: Pin the conversation
    pin_resp = await client.post(
        "/pin?con_uid=test-conv-pinned",
        headers={"Authorization": "Bearer mock_api_key_123"},
    )
    print(f"Pin response: {pin_resp.status_code} {pin_resp.json()}")
    assert pin_resp.status_code == 200

    # Step 3: Verify pinned status via query
    query_resp = await client.post(
        "/query_page",
        params={"conv_uid": "test-conv-pinned"},
        headers={"Authorization": "Bearer mock_api_key_123"},
    )
    print(f"Query after pin response: {query_resp.status_code} {query_resp.json()}")
    assert query_resp.status_code == 200
    data = query_resp.json()
    items = data.get("result", {}).get("items", [])
    assert len(items) > 0
    assert items[0]["is_pinned"] is True, "Conversation should be pinned before rename"

    # Step 4: Rename the conversation
    rename_resp = await client.post(
        "/rename",
        params={
            "con_uid": "test-conv-pinned",
            "new_summary": "Renamed After Pin Test",
        },
        headers={"Authorization": "Bearer mock_api_key_123"},
    )
    print(f"Rename response: {rename_resp.status_code} {rename_resp.json()}")
    assert rename_resp.status_code == 200

    # Step 5: Verify pinned status is preserved after rename
    query_after_resp = await client.post(
        "/query_page",
        params={"conv_uid": "test-conv-pinned"},
        headers={"Authorization": "Bearer mock_api_key_123"},
    )
    print(f"Query after rename response: {query_after_resp.status_code} {query_after_resp.json()}")
    assert query_after_resp.status_code == 200
    data_after = query_after_resp.json()
    items_after = data_after.get("result", {}).get("items", [])
    assert len(items_after) > 0
    pinned_after = items_after[0]["is_pinned"]
    summary_after = items_after[0]["user_input"]
    print(f"After rename: is_pinned={pinned_after}, summary={summary_after}")
    assert pinned_after is True, "is_pinned should be preserved after rename"
    assert summary_after == "Renamed After Pin Test", "Summary should be updated"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "client, asystem_app",
    [
        (
            {
                "app_caller": client_init_caller,
                "client_api_key": "test_token1",
            },
            {
                "app_config": {
                    f"{SERVE_CONFIG_KEY_PREFIX}api_keys": "test_token1,test_token2"
                }
            },
        ),
    ],
    indirect=["client", "asystem_app"],
)
async def test_rename_preserves_unpinned_status(client: AsyncClient, asystem_app):
    """Test that renaming an unpinned conversation keeps it unpinned."""
    # Create and rename without pinning
    # Note: In test context, router is included without prefix
    # Auth: conftest's config fixture has api_keys = "mock_api_key_123"
    create_resp = await client.post(
        "/new",
        params={
            "conv_uid": "test-conv-unpinned",
            "chat_mode": "chat_normal",
            "user_name": "test_user",
        },
        headers={"Authorization": "Bearer mock_api_key_123"},
    )
    print(f"Create response: {create_resp.status_code} {create_resp.json()}")
    assert create_resp.status_code == 200

    rename_resp = await client.post(
        "/rename",
        params={
            "con_uid": "test-conv-unpinned",
            "new_summary": "Renamed Unpinned Test",
        },
        headers={"Authorization": "Bearer mock_api_key_123"},
    )
    print(f"Rename response: {rename_resp.status_code} {rename_resp.json()}")
    assert rename_resp.status_code == 200

    query_resp = await client.post(
        "/query_page",
        params={"conv_uid": "test-conv-unpinned"},
        headers={"Authorization": "Bearer mock_api_key_123"},
    )
    print(f"Query after rename response: {query_resp.status_code} {query_resp.json()}")
    assert query_resp.status_code == 200
    data = query_resp.json()
    items = data.get("result", {}).get("items", [])
    assert len(items) > 0
    print(f"After rename: is_pinned={items[0]['is_pinned']}, summary={items[0]['user_input']}")
    assert items[0]["is_pinned"] is False, "Unpinned conversation should stay unpinned"
    assert items[0]["user_input"] == "Renamed Unpinned Test"