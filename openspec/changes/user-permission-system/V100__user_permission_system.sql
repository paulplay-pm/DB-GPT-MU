-- V1: 部门表 sys_dept
-- 树形结构，支持最多10级

CREATE TABLE IF NOT EXISTS sys_dept (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    code VARCHAR(64) NOT NULL COMMENT '部门编码(手工输入)',
    name VARCHAR(128) NOT NULL COMMENT '部门名称',
    parent_id BIGINT DEFAULT NULL COMMENT '父部门ID，NULL为根部门',
    level INT NOT NULL DEFAULT 1 COMMENT '层级(1-10)',
    sort INT DEFAULT 0 COMMENT '排序',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_parent_id (parent_id),
    INDEX idx_is_active (is_active),

    CONSTRAINT fk_dept_parent FOREIGN KEY (parent_id) REFERENCES sys_dept(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门表';
-- V2: 权限表 sys_permission + 初始化菜单权限数据
-- 所有一级菜单和子菜单纳入权限管理

CREATE TABLE IF NOT EXISTS sys_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    code VARCHAR(128) NOT NULL COMMENT '权限编码(唯一，对应菜单路径)',
    name VARCHAR(128) NOT NULL COMMENT '权限名称',
    parent_code VARCHAR(128) DEFAULT NULL COMMENT '父权限编码，NULL为根',
    perm_type VARCHAR(32) NOT NULL DEFAULT 'menu' COMMENT '类型: menu/button/api',
    sort INT DEFAULT 0 COMMENT '排序',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=启用 0=禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_permission_code (code),
    INDEX idx_parent_code (parent_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 初始化菜单权限数据
INSERT INTO sys_permission (code, name, parent_code, perm_type, sort) VALUES
('explore', '首页', NULL, 'menu', 1),
('skills', '技能', NULL, 'menu', 2),
('datasources', '数据源', NULL, 'menu', 3),
('knowledge', '知识库', NULL, 'menu', 4),
('settings', '设置', NULL, 'menu', 5),
('settings.app_management', '应用管理', 'settings', 'menu', 51),
('settings.model_manage', '模型管理', 'settings', 'menu', 52),
('settings.awel_workflow', 'AWEL工作流', 'settings', 'menu', 53),
('settings.prompts', '提示词', 'settings', 'menu', 54),
('settings.dbgpts_community', 'DBGPTs社区', 'settings', 'menu', 55),
('settings.models_evaluation', '模型评测', 'settings', 'menu', 56);
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
-- V4: 角色权限关联表 sys_role_permission

CREATE TABLE IF NOT EXISTS sys_role_permission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    role_id BIGINT NOT NULL COMMENT '角色ID',
    permission_id BIGINT NOT NULL COMMENT '权限ID',

    UNIQUE KEY uk_role_perm (role_id, permission_id),
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id),

    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES sys_permission(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';
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
-- V6: 用户角色关联表 sys_user_role

CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    role_id BIGINT NOT NULL COMMENT '角色ID',

    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),

    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES sys_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES sys_role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';
-- V7: 用户注册申请表 sys_user_registration
-- 用户提交注册申请，管理员审核后创建正式用户

CREATE TABLE IF NOT EXISTS sys_user_registration (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    user_name VARCHAR(64) NOT NULL COMMENT '申请人姓名',
    login_name VARCHAR(64) NOT NULL COMMENT '申请登录名',
    password_hash VARCHAR(256) NOT NULL COMMENT 'bcrypt加密密码',
    real_name VARCHAR(128) DEFAULT NULL COMMENT '真实姓名',
    email VARCHAR(128) DEFAULT NULL COMMENT '邮箱',
    apply_dept_id BIGINT DEFAULT NULL COMMENT '申请部门ID',
    status VARCHAR(32) NOT NULL DEFAULT 'pending' COMMENT 'pending=待审核 approved=已通过 rejected=已拒绝',
    apply_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    approved_by BIGINT DEFAULT NULL COMMENT '审核人用户ID',
    approved_time DATETIME DEFAULT NULL COMMENT '审核时间',
    approved_dept_id BIGINT DEFAULT NULL COMMENT '审核分配的部门ID',
    reject_reason VARCHAR(512) DEFAULT NULL COMMENT '拒绝原因',

    UNIQUE KEY uk_login_name (login_name),
    INDEX idx_status (status),
    INDEX idx_apply_time (apply_time),

    CONSTRAINT fk_reg_apply_dept FOREIGN KEY (apply_dept_id) REFERENCES sys_dept(id) ON DELETE SET NULL,
    CONSTRAINT fk_reg_approved_by FOREIGN KEY (approved_by) REFERENCES sys_user(id) ON DELETE SET NULL,
    CONSTRAINT fk_reg_approved_dept FOREIGN KEY (approved_dept_id) REFERENCES sys_dept(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户注册申请表';



  -- Add phone column to sys_user table
  ALTER TABLE sys_user ADD COLUMN phone VARCHAR(32) NULL COMMENT '手机号';

  -- Add phone column to sys_user_registration table
  ALTER TABLE sys_user_registration ADD COLUMN phone VARCHAR(32) NULL COMMENT '手机号';

  -- V3: 添加管理系统权限点（审核用户、用户管理、角色管理、部门管理、权限管理）
-- 这些权限对应管理后台的管理功能菜单

INSERT INTO sys_permission (code, name, parent_code, perm_type, sort) VALUES
-- 父级：管理
('management', '管理', NULL, 'menu', 6),

-- 子级：审核用户
('management.registration_review', '审核用户', 'management', 'menu', 61),

-- 子级：用户管理
('management.user_management', '用户管理', 'management', 'menu', 62),

-- 子级：角色管理
('management.role_management', '角色管理', 'management', 'menu', 63),

-- 子级：部门管理
('management.dept_management', '部门管理', 'management', 'menu', 64),

-- 子级：权限管理
('management.permission_management', '权限管理', 'management', 'menu', 65);
