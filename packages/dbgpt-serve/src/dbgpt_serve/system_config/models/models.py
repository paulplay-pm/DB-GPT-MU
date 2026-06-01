"""DB Model for SystemConfig - Key-Value format with auto-increment ID."""

import json
import logging
from datetime import datetime
from typing import Any, List, Optional

from sqlalchemy import Column, DateTime, Integer, String, Text

from dbgpt.storage.metadata import BaseDao, Model

logger = logging.getLogger(__name__)


class SystemConfigEntity(Model):
    """System config entity with key-value storage."""

    __tablename__ = "dbgpt_system_config"

    id = Column(Integer, primary_key=True, autoincrement=True, comment="自增ID")
    config_key = Column(String(64), unique=True, nullable=False, comment="配置键，格式: category.sub_key")
    config_value = Column(Text, nullable=True, comment="配置值(JSON格式)")
    config_type = Column(String(32), default="string", comment="值类型: string, json, number, boolean")
    category = Column(String(64), nullable=True, comment="配置分类，如: brand, memory, security")
    description = Column(String(256), nullable=True, comment="配置描述")
    gmt_created = Column(DateTime, default=datetime.now, comment="记录创建时间")
    gmt_modified = Column(DateTime, default=datetime.now, onupdate=datetime.now, comment="记录更新时间")


class SystemConfigDao(BaseDao):
    """Data access object for SystemConfig."""

    def get_config(self, config_key: str) -> Optional[SystemConfigEntity]:
        """Get system config by key."""
        session = self.get_raw_session()
        try:
            config = session.query(SystemConfigEntity).filter(
                SystemConfigEntity.config_key == config_key
            ).first()
            return config
        finally:
            session.close()

    def get_configs_by_category(self, category: str) -> List[SystemConfigEntity]:
        """Get all configs in a category."""
        session = self.get_raw_session()
        try:
            configs = session.query(SystemConfigEntity).filter(
                SystemConfigEntity.category == category
            ).all()
            return configs
        finally:
            session.close()

    def save_config(self, config: SystemConfigEntity) -> SystemConfigEntity:
        """Save or update system config."""
        session = self.get_raw_session()
        try:
            existing = session.query(SystemConfigEntity).filter(
                SystemConfigEntity.config_key == config.config_key
            ).first()
            if existing:
                existing.config_value = config.config_value
                existing.config_type = config.config_type
                existing.category = config.category
                existing.description = config.description
                existing.gmt_modified = datetime.now()
                session.commit()
                # Refresh to get updated values while session is still open
                session.refresh(existing)
                # Extract values before closing session
                result_config_value = existing.config_value
                result_config_type = existing.config_type
                result_category = existing.category
                result_description = existing.description
                result_gmt_modified = existing.gmt_modified
                session.close()
                # Create a detached entity with the updated values
                result = SystemConfigEntity(
                    id=existing.id,
                    config_key=existing.config_key,
                    config_value=result_config_value,
                    config_type=result_config_type,
                    category=result_category,
                    description=result_description,
                    gmt_created=existing.gmt_created,
                    gmt_modified=result_gmt_modified,
                )
                return result
            else:
                session.add(config)
                session.commit()
                session.refresh(config)
                result_config_value = config.config_value
                result_config_type = config.config_type
                result_category = config.category
                result_description = config.description
                result_gmt_modified = config.gmt_modified
                session.close()
                result = SystemConfigEntity(
                    id=config.id,
                    config_key=config.config_key,
                    config_value=result_config_value,
                    config_type=result_config_type,
                    category=result_category,
                    description=result_description,
                    gmt_created=config.gmt_created,
                    gmt_modified=result_gmt_modified,
                )
                return result
        finally:
            if session.is_active:
                session.close()

    def delete_config(self, config_key: str) -> bool:
        """Delete a config by key."""
        session = self.get_raw_session()
        try:
            config = session.query(SystemConfigEntity).filter(
                SystemConfigEntity.config_key == config_key
            ).first()
            if config:
                session.delete(config)
                session.commit()
                return True
            return False
        finally:
            session.close()

    def save_configs_batch(self, configs: List[SystemConfigEntity]) -> List[SystemConfigEntity]:
        """Batch save or update configs."""
        session = self.get_raw_session()
        try:
            results = []
            for config in configs:
                existing = session.query(SystemConfigEntity).filter(
                    SystemConfigEntity.config_key == config.config_key
                ).first()
                if existing:
                    existing.config_value = config.config_value
                    existing.config_type = config.config_type
                    existing.category = config.category
                    existing.description = config.description
                    existing.gmt_modified = datetime.now()
                    results.append(existing)
                else:
                    session.add(config)
                    results.append(config)
            session.commit()
            return results
        finally:
            session.close()


class ConfigSerializer:
    """Helper to serialize/deserialize config values."""

    @staticmethod
    def serialize(value: Any, config_type: str = "string") -> str:
        """Serialize value to string."""
        if value is None:
            return None
        if config_type == "json":
            return json.dumps(value, ensure_ascii=False)
        elif config_type == "number":
            return str(value)
        elif config_type == "boolean":
            return str(bool(value))
        else:
            return str(value)

    @staticmethod
    def deserialize(value: Optional[str], config_type: str = "string") -> Any:
        """Deserialize value from string."""
        if value is None:
            return None
        if config_type == "json":
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        elif config_type == "number":
            try:
                return float(value)
            except ValueError:
                return value
        elif config_type == "boolean":
            return value.lower() in ("true", "1", "yes") if value else False
        else:
            return value