-- From 0.8.x to 0.9.0, we have the following changes:
USE dbgpt;

-- 添加 is_pinned 列
ALTER TABLE `chat_history` ADD COLUMN `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the session is pinned';

-- 创建索引
CREATE INDEX `idx_chat_history_is_pinned` ON `chat_history`(`is_pinned`);