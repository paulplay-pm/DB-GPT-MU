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
