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

 -- ============================================
  -- DB-GPT 系统配置表 (Key-Value + 自增ID)
  -- 适用于 MySQL 5.7+ / 8.0+
  -- ============================================

  CREATE TABLE `dbgpt_system_config` (
      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
      `config_key` VARCHAR(64) NOT NULL COMMENT '配置键，格式: category.sub_key',
      `config_value` TEXT COMMENT '配置值(JSON格式)',
      `config_type` VARCHAR(32) DEFAULT 'string' COMMENT '值类型: string, json, number, boolean',
      `category` VARCHAR(64) DEFAULT NULL COMMENT '配置分类，如: brand, memory, security',
      `description` VARCHAR(256) DEFAULT NULL COMMENT '配置描述',
      `gmt_created` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
      `gmt_modified` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
      PRIMARY KEY (`id`),
      UNIQUE KEY `uk_config_key` (`config_key`),
      INDEX `idx_category` (`category`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

  -- ============================================
  -- 初始化默认品牌配置
  -- ============================================

  INSERT INTO `dbgpt_system_config` (`config_key`, `config_value`, `config_type`, `category`, `description`)
  VALUES (
      'brand.settings',
      '{"logo_url": null, "product_name_zh": "DB-GPT", "product_name_en": "DB-GPT", "slogan": "开口问数，预见洞察"}',
      'json',
      'brand',
      '品牌配置'
  );
