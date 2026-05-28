-- V3: 角色表 sys_role

CREATE TABLE IF NOT EXISTS sys_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    code VARCHAR(64) NOT NULL COMMENT '角色编码(唯一)',
    name VARCHAR(128) NOT NULL COMMENT '角色名称',
    description VARCHAR(512) DEFAULT NULL COMMENT '角色描述',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_role_code (code),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';
