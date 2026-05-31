"""System config service with extensible key-value storage."""

import json
import logging
import os
import uuid
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from fastapi import HTTPException

from dbgpt.component import SystemApp
from dbgpt.storage.metadata import BaseDao
from dbgpt_serve.core import BaseService
from dbgpt_serve.system_config.config import ServeConfig

from ..models.models import ConfigSerializer, SystemConfigDao, SystemConfigEntity

logger = logging.getLogger(__name__)

SERVE_SERVICE_COMPONENT_NAME = "system_config_service"


class BaseConfigHandler(ABC):
    """Abstract base class for config handlers."""

    @property
    @abstractmethod
    def category(self) -> str:
        """Return the config category name."""
        pass

    @property
    @abstractmethod
    def default_config(self) -> Dict[str, Any]:
        """Return default configuration values."""
        pass

    @abstractmethod
    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize config data before saving."""
        pass


class BrandConfigHandler(BaseConfigHandler):
    """Handler for brand configuration."""

    @property
    def category(self) -> str:
        return "brand"

    @property
    def default_config(self) -> Dict[str, Any]:
        return {
            "logo_url": None,
            "product_name_zh": "DB-GPT",
            "product_name_en": "DB-GPT",
            "slogan": "开口问数，预见洞察",
            "slogan_en": "Ask Data, Find Insights",
        }

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate brand config data."""
        validated = {}
        for key, default_value in self.default_config.items():
            validated[key] = data.get(key, default_value)

        # Validate slogan length
        if validated.get("slogan") and len(validated["slogan"]) > 256:
            validated["slogan"] = validated["slogan"][:256]
        if validated.get("slogan_en") and len(validated["slogan_en"]) > 256:
            validated["slogan_en"] = validated["slogan_en"][:256]

        return validated


class ConfigService(BaseService):
    """
    Extensible system configuration service.

    Supports key-value storage with categories, making it easy to add
    new configuration parameters without modifying the schema.
    """

    name = SERVE_SERVICE_COMPONENT_NAME

    # Registry of config handlers by category
    _handlers: Dict[str, BaseConfigHandler] = {}

    def __init__(self, system_app: SystemApp, config: ServeConfig = None):
        self._system_app = system_app
        self._dao: Optional[SystemConfigDao] = None
        self._config = config
        super().__init__(system_app)

    @property
    def dao(self) -> BaseDao:
        """Get the dao."""
        return self._dao

    @property
    def config(self) -> ServeConfig:
        """Get the config."""
        return self._config

    def init_app(self, system_app: SystemApp) -> None:
        """Initialize the service."""
        super().init_app(system_app)
        self._dao = SystemConfigDao()
        self._register_default_handlers()

    def _register_default_handlers(self) -> None:
        """Register default config handlers."""
        self.register_handler(BrandConfigHandler())

    @classmethod
    def register_handler(cls, handler: BaseConfigHandler) -> None:
        """Register a config handler for a category."""
        cls._handlers[handler.category] = handler

    def _get_handler(self, category: str) -> Optional[BaseConfigHandler]:
        """Get handler for a category."""
        return self._handlers.get(category)

    def _config_key(self, category: str, sub_key: str = "settings") -> str:
        """Generate a full config key."""
        return f"{category}.{sub_key}"

    # ============== Generic Config Operations ==============

    def get_config(self, config_key: str, default: Any = None) -> Any:
        """Get a config value by key."""
        entity = self._dao.get_config(config_key)
        if not entity:
            return default
        return ConfigSerializer.deserialize(entity.config_value, entity.config_type)

    def set_config(
        self,
        config_key: str,
        value: Any,
        config_type: str = "string",
        category: str = None,
        description: str = None,
    ) -> bool:
        """Set a config value."""
        entity = SystemConfigEntity(
            config_key=config_key,
            config_value=ConfigSerializer.serialize(value, config_type),
            config_type=config_type,
            category=category,
            description=description,
        )
        self._dao.save_config(entity)
        return True

    def delete_config(self, config_key: str) -> bool:
        """Delete a config by key."""
        return self._dao.delete_config(config_key)

    def get_category_configs(self, category: str) -> Dict[str, Any]:
        """Get all configs in a category as a key-value dict."""
        handler = self._get_handler(category)
        default_config = handler.default_config if handler else {}

        entities = self._dao.get_configs_by_category(category)
        if not entities and default_config:
            return default_config.copy()

        result = {}
        for entity in entities:
            sub_key = entity.config_key.split(".", 1)[1] if "." in entity.config_key else entity.config_key
            result[sub_key] = ConfigSerializer.deserialize(entity.config_value, entity.config_type)

        if not result and default_config:
            return default_config.copy()

        return result

    # ============== Brand Config Operations ==============

    def get_brand_config(self) -> dict:
        """Get brand configuration with defaults."""
        handler = self._get_handler("brand")
        default_config = handler.default_config if handler else {}

        entity = self._dao.get_config(self._config_key("brand"))
        if not entity:
            return default_config.copy()

        try:
            stored = json.loads(entity.config_value) if entity.config_value else {}
        except json.JSONDecodeError:
            return default_config.copy()

        result = default_config.copy()
        result.update({k: v for k, v in stored.items() if v is not None})
        return result

    def update_brand_config(self, data: dict) -> dict:
        """Update brand configuration (partial update supported)."""
        handler = self._get_handler("brand")
        default_config = handler.default_config if handler else {}

        entity = self._dao.get_config(self._config_key("brand"))
        if not entity:
            entity = SystemConfigEntity(
                config_key=self._config_key("brand"),
                category="brand",
                config_type="json",
                description="品牌配置",
            )

        # Get current values
        try:
            current = json.loads(entity.config_value) if entity.config_value else {}
        except json.JSONDecodeError:
            current = {}

        # Merge with defaults
        merged = default_config.copy()
        merged.update(current)
        merged.update(data)

        # Validate
        if handler:
            merged = handler.validate(merged)

        entity.config_value = json.dumps(merged, ensure_ascii=False)
        saved = self._dao.save_config(entity)
        return json.loads(saved.config_value)

    # ============== Memory Config Operations ==============

    def get_memory_config(self) -> dict:
        """Get memory management configuration with defaults."""
        default = {
            "auto_distill": True,
            "trigger_frequency": "daily",
            "confidence_threshold": 0.8,
            "max_memories_per_user": 1000,
            "memory_types": {
                "user_preference": True,
                "data_knowledge": True,
                "analysis_mode": True,
                "business_term": True,
            },
        }
        entity = self._dao.get_config(self._config_key("memory"))
        if not entity:
            return default

        try:
            stored = json.loads(entity.config_value) if entity.config_value else {}
        except json.JSONDecodeError:
            return default

        result = default.copy()
        result.update({k: v for k, v in stored.items() if v is not None})
        return result

    def update_memory_config(self, data: dict) -> dict:
        """Update memory management configuration."""
        default = {
            "auto_distill": True,
            "trigger_frequency": "daily",
            "confidence_threshold": 0.8,
            "max_memories_per_user": 1000,
            "memory_types": {
                "user_preference": True,
                "data_knowledge": True,
                "analysis_mode": True,
                "business_term": True,
            },
        }

        entity = self._dao.get_config(self._config_key("memory"))
        if not entity:
            entity = SystemConfigEntity(
                config_key=self._config_key("memory"),
                category="memory",
                config_type="json",
                description="记忆管理配置",
            )

        try:
            current = json.loads(entity.config_value) if entity.config_value else {}
        except json.JSONDecodeError:
            current = {}

        merged = default.copy()
        merged.update(current)
        merged.update(data)

        entity.config_value = json.dumps(merged, ensure_ascii=False)
        saved = self._dao.save_config(entity)
        return json.loads(saved.config_value)

    # ============== Security Config Operations ==============

    def get_security_config(self) -> dict:
        """Get security settings configuration."""
        default = {
            "password_min_length": 8,
            "password_expire_days": 90,
            "login_fail_lock_count": 5,
            "session_timeout_minutes": 30,
            "single_device_login": False,
            "sql_query_row_limit": 1000,
            "disable_ddl_execution": True,
            "sensitive_data_masking": True,
        }
        entity = self._dao.get_config(self._config_key("security"))
        if not entity:
            return default

        try:
            stored = json.loads(entity.config_value) if entity.config_value else {}
        except json.JSONDecodeError:
            return default

        result = default.copy()
        result.update({k: v for k, v in stored.items() if v is not None})
        return result

    def update_security_config(self, data: dict) -> dict:
        """Update security settings configuration."""
        default = {
            "password_min_length": 8,
            "password_expire_days": 90,
            "login_fail_lock_count": 5,
            "session_timeout_minutes": 30,
            "single_device_login": False,
            "sql_query_row_limit": 1000,
            "disable_ddl_execution": True,
            "sensitive_data_masking": True,
        }

        entity = self._dao.get_config(self._config_key("security"))
        if not entity:
            entity = SystemConfigEntity(
                config_key=self._config_key("security"),
                category="security",
                config_type="json",
                description="安全设置配置",
            )

        try:
            current = json.loads(entity.config_value) if entity.config_value else {}
        except json.JSONDecodeError:
            current = {}

        merged = default.copy()
        merged.update(current)
        merged.update(data)

        entity.config_value = json.dumps(merged, ensure_ascii=False)
        saved = self._dao.save_config(entity)
        return json.loads(saved.config_value)

    # ============== File Upload Operations ==============

    def upload_file(self, file_content: bytes, filename: str, sub_dir: str = "general") -> str:
        """Upload file and return the stored URL."""
        ext = os.path.splitext(filename)[1].lower()
        allowed_exts = {".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp"}
        if ext not in allowed_exts:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {ext}. Allowed: {', '.join(allowed_exts)}"
            )

        if len(file_content) > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 5MB."
            )

        upload_dir = f"/tmp/dbgpt_uploads/{sub_dir}"
        os.makedirs(upload_dir, exist_ok=True)

        unique_filename = f"{uuid.uuid4()}{ext}"
        file_path = os.path.join(upload_dir, unique_filename)

        with open(file_path, "wb") as f:
            f.write(file_content)

        return f"/uploads/{sub_dir}/{unique_filename}"

    def upload_logo(self, file_content: bytes, filename: str) -> str:
        """Upload logo file."""
        return self.upload_file(file_content, filename, "logos")