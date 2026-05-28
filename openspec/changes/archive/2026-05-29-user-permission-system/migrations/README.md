# 用户权限管理系统 - 数据库升级说明

## 概述

本目录包含用户权限管理系统的 7 个数据库迁移脚本，按顺序执行即可完成升级。

## 执行顺序

```
V1__create_sys_dept.sql
  → V2__create_sys_permission.sql
    → V3__create_sys_role.sql
      → V4__create_sys_role_permission.sql
        → V5__create_sys_user.sql
          → V6__create_sys_user_role.sql
            → V7__create_sys_user_registration.sql
```

## 方式一：独立脚本（推荐）

按顺序执行每个脚本：

```bash
mysql -u root -p your_database < V1__create_sys_dept.sql
mysql -u root -p your_database < V2__create_sys_permission.sql
# ... 以此类推
```

## 方式二：合并脚本

执行根目录的 `V100__user_permission_system.sql`（已合并所有脚本）

```bash
mysql -u root -p your_database < V100__user_permission_system.sql
```

## 超级管理员账户

| 字段 | 值 |
|------|-----|
| user_id | SUPER_ADMIN |
| login_name | admin |
| 密码 | Admin123! |
| 超级管理员 | 是 |

**首次登录后请立即修改密码。**

## 权限点

系统预置了 11 个菜单权限点（见 V2），未来新增菜单需手动插入权限数据。

## 回滚

如需回滚，按相反顺序执行 `DROP TABLE`：

```sql
DROP TABLE IF EXISTS sys_user_registration;
DROP TABLE IF EXISTS sys_user_role;
DROP TABLE IF EXISTS sys_role_permission;
DROP TABLE IF EXISTS sys_user;
DROP TABLE IF EXISTS sys_role;
DROP TABLE IF EXISTS sys_permission;
DROP TABLE IF EXISTS sys_dept;
```

## 注意事项

1. 所有表使用 `InnoDB` 引擎 + `utf8mb4` 字符集
2. 外键约束默认 `ON DELETE SET NULL`
3. 超级管理员记录内置，不可删除
4. 密码使用 bcrypt 加密存储
