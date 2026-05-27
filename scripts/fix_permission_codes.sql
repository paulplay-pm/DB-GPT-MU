-- 修复权限 code 不匹配问题
-- Sidebar 使用 permissionKey，后端返回的 code 必须一致

-- chat.view 和 skills.view 已正确
-- 将 datasources.view 更新为 datasources（如果存在）
UPDATE sys_permission SET code = 'datasources' WHERE code = 'datasources.view';

-- 将 knowledge.view 更新为 knowledge（如果存在）
UPDATE sys_permission SET code = 'knowledge' WHERE code = 'knowledge.view';

-- 提交更改
COMMIT;