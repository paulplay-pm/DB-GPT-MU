-- Create conversation_categories table for category management
CREATE TABLE IF NOT EXISTS conversation_categories (
    category_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(128) NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
    gmt_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conv_cat_user_name ON conversation_categories(user_name);

-- Add category_id column to chat_history for conversation-category assignment
ALTER TABLE chat_history ADD COLUMN category_id INTEGER;

CREATE INDEX idx_chat_history_category_id ON chat_history(category_id);