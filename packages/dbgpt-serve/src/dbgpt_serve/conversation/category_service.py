"""Category service for conversation management."""

from datetime import datetime
from typing import List, Optional

from dbgpt.storage.chat_history.conversation_category_db import ConversationCategory
from dbgpt.storage.metadata import BaseDao


class CategoryDao(BaseDao[ConversationCategory, dict, dict]):
    """DAO for conversation categories."""

    def from_request(self, request: dict) -> ConversationCategory:
        """Convert request dict to entity."""
        return ConversationCategory(**request)

    def to_response(self, entity: ConversationCategory) -> dict:
        """Convert entity to response dict."""
        return {
            "category_id": entity.category_id,
            "user_name": entity.user_name,
            "name": entity.name,
            "color": entity.color,
            "gmt_created": (
                entity.gmt_created.strftime("%Y-%m-%d %H:%M:%S")
                if entity.gmt_created
                else None
            ),
        }


class CategoryService:
    """Service for managing conversation categories."""

    def __init__(self):
        self._dao = CategoryDao()

    def create_category(
        self, user_name: str, name: str, color: str = "#3B82F6"
    ) -> dict:
        """Create a new category.

        Args:
            user_name: The user identifier
            name: The category name
            color: The category color

        Returns:
            The created category
        """
        with self._dao.session() as session:
            entity = ConversationCategory(
                user_name=user_name, name=name, color=color, gmt_created=datetime.now()
            )
            session.add(entity)
            session.commit()
            session.refresh(entity)
            return self._dao.to_response(entity)

    def get_user_categories(self, user_name: str) -> List[dict]:
        """Get all categories for a user.

        Args:
            user_name: The user identifier

        Returns:
            List of user's categories
        """
        with self._dao.session(commit=False) as session:
            categories = (
                session.query(ConversationCategory)
                .filter(ConversationCategory.user_name == user_name)
                .order_by(ConversationCategory.gmt_created.asc())
                .all()
            )
            return [self._dao.to_response(c) for c in categories]

    def rename_category(
        self, category_id: int, user_name: str, name: str
    ) -> Optional[dict]:
        """Rename a category.

        Args:
            category_id: The category id
            user_name: The user identifier (for authorization)
            name: The new category name

        Returns:
            The updated category or None if not found/not authorized
        """
        with self._dao.session() as session:
            category = (
                session.query(ConversationCategory)
                .filter(
                    ConversationCategory.category_id == category_id,
                    ConversationCategory.user_name == user_name,
                )
                .first()
            )
            if not category:
                return None
            category.name = name
            session.commit()
            session.refresh(category)
            return self._dao.to_response(category)

    def delete_category(self, category_id: int, user_name: str) -> bool:
        """Delete a category.

        Args:
            category_id: The category id
            user_name: The user identifier (for authorization)

        Returns:
            True if deleted, False if not found/not authorized
        """
        with self._dao.session() as session:
            from dbgpt.storage.chat_history.chat_history_db import ChatHistoryEntity

            # Verify ownership
            category = (
                session.query(ConversationCategory)
                .filter(
                    ConversationCategory.category_id == category_id,
                    ConversationCategory.user_name == user_name,
                )
                .first()
            )
            if not category:
                return False

            # Move conversations to uncategorized (category_id = NULL)
            session.query(ChatHistoryEntity).filter(
                ChatHistoryEntity.category_id == category_id
            ).update({"category_id": None})

            # Delete the category
            session.delete(category)
            session.commit()
            return True

    def move_conversations(
        self, conv_uids: List[str], category_id: Optional[int], user_name: str
    ) -> int:
        """Move conversations to a category.

        Args:
            conv_uids: List of conversation UIDs
            category_id: Target category id (None for uncategorized)
            user_name: The user identifier (for authorization)

        Returns:
            Number of conversations moved
        """
        with self._dao.session() as session:
            from dbgpt.storage.chat_history.chat_history_db import ChatHistoryEntity

            # Verify category ownership if moving to a specific category
            if category_id is not None:
                category = (
                    session.query(ConversationCategory)
                    .filter(
                        ConversationCategory.category_id == category_id,
                        ConversationCategory.user_name == user_name,
                    )
                    .first()
                )
                if not category:
                    return 0

            # Move conversations
            result = (
                session.query(ChatHistoryEntity)
                .filter(
                    ChatHistoryEntity.conv_uid.in_(conv_uids),
                    ChatHistoryEntity.user_name == user_name,
                )
                .update({"category_id": category_id}, synchronize_session=False)
            )
            session.commit()
            return result

    def get_category_counts(self, user_name: str) -> dict:
        """Get conversation counts per category.

        Args:
            user_name: The user identifier

        Returns:
            Dict mapping category_id to count (0 for uncategorized)
        """
        with self._dao.session(commit=False) as session:
            from dbgpt.storage.chat_history.chat_history_db import ChatHistoryEntity
            from sqlalchemy import func

            # Get counts per category
            results = (
                session.query(
                    ChatHistoryEntity.category_id, func.count(ChatHistoryEntity.id)
                )
                .filter(ChatHistoryEntity.user_name == user_name)
                .group_by(ChatHistoryEntity.category_id)
                .all()
            )
            return {cat_id: count for cat_id, count in results}