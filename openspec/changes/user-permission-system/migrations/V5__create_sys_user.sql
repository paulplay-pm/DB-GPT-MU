-- V5: 用户表 sys_user + 超级管理员初始化
-- 密码 Admin123! 的 bcrypt hash: $2b$12$cfA8.jBjn9UK52K6hi1KH.yhy40h/j/BZZsR/c9Ehmy.KaHuLwLqm

CREATE TABLE IF NOT EXISTS sys_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    user_id VARCHAR(64) NOT NULL COMMENT '用户唯一标识(关联其他模块)',
    login_name VARCHAR(64) NOT NULL COMMENT '登录用户名',
    password_hash VARCHAR(256) NOT NULL COMMENT 'bcrypt加密密码',
    real_name VARCHAR(128) DEFAULT NULL COMMENT '真实姓名',
    email VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
    dept_id BIGINT DEFAULT NULL COMMENT '部门ID',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=禁用',
    is_super_admin TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=超级管理员 0=普通用户',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uk_user_id (user_id),
    UNIQUE KEY uk_login_name (login_name),
    INDEX idx_dept_id (dept_id),
    INDEX idx_is_active (is_active),

    CONSTRAINT fk_user_dept FOREIGN KEY (dept_id) REFERENCES sys_dept(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 初始化超级管理员
INSERT INTO sys_user (user_id, login_name, password_hash, real_name, dept_id, is_active, is_super_admin, created_at, updated_at)
VALUES ('SUPER_ADMIN', 'admin', '$2b$12$cfA8.jBjn9UK52K6hi1KH.yhy40h/j/BZZsR/c9Ehmy.KaHuLwLqm', '超级管理员', NULL, 1, 1, NOW(), NOW());
