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
