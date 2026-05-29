"""Conversation category database model."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Index, Integer, String, UniqueConstraint

from dbgpt.storage.metadata import Model


class ConversationCategory(Model):
    """Conversation category entity."""

    __tablename__ = "conversation_categories"
    __table_args__ = (
        UniqueConstraint("category_id", name="uk_category_id"),
        Index("idx_user_name", "user_name"),
    )
    category_id = Column(
        Integer, primary_key=True, autoincrement=True, comment="autoincrement id"
    )
    user_name = Column(
        String(128), nullable=False, comment="User identifier"
    )
    name = Column(
        String(50), nullable=False, comment="Category name"
    )
    color = Column(
        String(20), nullable=False, default="#3B82F6", comment="Category color"
    )
    gmt_created = Column(
        DateTime, default=datetime.now, comment="Record creation time"
    )