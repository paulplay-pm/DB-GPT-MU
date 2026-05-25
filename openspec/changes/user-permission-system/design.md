# 设计: 用户权限管理系统

## 1. 数据模型

### 1.1 ER 图

```
┌─────────────────┐      ┌─────────────────┐
│   sys_dept      │      │sys_permission   │
├─────────────────┤      ├─────────────────┤
│ id (PK, AI)     │      │ id (PK, AI)     │
│ code            │      │ code            │ ← 唯一，如 "settings.app"
│ name            │      │ name            │ ← "应用管理"
│ parent_id (FK)  │←─┐   │ parent_code     │ ← 父权限code，NULL为根
│ level           │  │   │ perm_type       │ ← menu/button/api
│ sort            │  │   │ sort            │
│ is_active       │  │   │ is_active       │
└─────────────────┘  │   └─────────────────┘
         │           │
         │           │
         ▼           │
┌─────────────────┐  │
│  sys_user       │  │
├─────────────────┤  │
│ id (PK, AI)     │  │
│ user_id         │←─┼─── 关联其他模块的唯一标识
│ user_name       │  │    (不同于登录名)
│ login_name      │  │
│ password_hash   │  │
│ real_name       │  │
│ email           │  │
│ dept_id (FK)    │──┘
│ is_active       │
│ is_super_admin  │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│   sys_role      │      │sys_role_perm    │
├─────────────────┤      ├─────────────────┤
│ id (PK, AI)     │      │ id (PK, AI)     │
│ code            │      │ role_id (FK)    │──────┐
│ name            │      │ permission_id   │──────┘
│ description     │      │ (FK)                │
│ is_active       │──────────────────────────→ sys_permission.id
└─────────────────┘

┌─────────────────┐      ┌─────────────────┐
│  sys_user_role  │      │sys_user_reg     │
├─────────────────┤      ├─────────────────┤
│ id (PK, AI)     │      │ id (PK, AI)     │
│ user_id (FK)    │──────│ user_name       │
│ role_id (FK)    │──────│ password_hash   │
└─────────────────┘      │ real_name       │
                         │ email           │
                         │ apply_dept_id   │
                         │ status          │ ← pending/approved/rejected
                         │ apply_time      │
                         │ approved_by     │
                         │ approved_time   │
                         │ approved_dept_id│ ← 审核时指定
                         └─────────────────┘

审核后创建用户，同时插入 sys_user_role
```

### 1.2 表结构

#### sys_dept (部门表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| code | VARCHAR(64) | NOT NULL | 手工输入的业务编码 |
| name | VARCHAR(128) | NOT NULL | 部门名称 |
| parent_id | BIGINT | FK → sys_dept.id, NULL | 父部门，NULL为根 |
| level | INT | NOT NULL, DEFAULT 1 | 层级 1-10 |
| sort | INT | DEFAULT 0 | 排序 |
| is_active | TINYINT(1) | DEFAULT 1 | 1=启用 0=禁用 |
| created_at | DATETIME | | |
| updated_at | DATETIME | | |

索引: `idx_parent_id`, `idx_is_active`

#### sys_permission (权限表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| code | VARCHAR(128) | UNIQUE, NOT NULL | 唯一编码，对应菜单路径 |
| name | VARCHAR(128) | NOT NULL | 权限名称 |
| parent_code | VARCHAR(128) | FK → sys_permission.code | 父权限，NULL为根 |
| perm_type | VARCHAR(32) | NOT NULL | menu/button/api |
| sort | INT | DEFAULT 0 | 排序 |
| is_active | TINYINT(1) | DEFAULT 1 | |
| created_at | DATETIME | | |

索引: `idx_code`, `idx_parent_code`

#### sys_role (角色表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| code | VARCHAR(64) | UNIQUE, NOT NULL | 角色编码 |
| name | VARCHAR(128) | NOT NULL | 角色名称 |
| description | VARCHAR(512) | | |
| is_active | TINYINT(1) | DEFAULT 1 | |
| created_at | DATETIME | | |
| updated_at | DATETIME | | |

索引: `idx_code`, `idx_is_active`

#### sys_role_permission (角色权限关联表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| role_id | BIGINT | FK → sys_role.id | |
| permission_id | BIGINT | FK → sys_permission.id | |
| UNIQUE(role_id, permission_id) | | | |

#### sys_user (用户表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| user_id | VARCHAR(64) | UNIQUE, NOT NULL | 关联其他模块的唯一标识 |
| login_name | VARCHAR(64) | UNIQUE, NOT NULL | 登录用户名 |
| password_hash | VARCHAR(256) | NOT NULL | bcrypt 哈希 |
| real_name | VARCHAR(128) | | 真实姓名 |
| email | VARCHAR(128) | | |
| dept_id | BIGINT | FK → sys_dept.id, NULL | |
| is_active | TINYINT(1) | DEFAULT 1 | |
| is_super_admin | TINYINT(1) | DEFAULT 0 | 超级管理员标记 |
| created_at | DATETIME | | |
| updated_at | DATETIME | | |

索引: `idx_user_id`, `idx_login_name`, `idx_dept_id`, `idx_is_active`

#### sys_user_role (用户角色关联表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| user_id | BIGINT | FK → sys_user.id | |
| role_id | BIGINT | FK → sys_role.id | |
| UNIQUE(user_id, role_id) | | | |

#### sys_user_registration (用户注册申请表)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | |
| user_name | VARCHAR(64) | NOT NULL | 申请人姓名 |
| login_name | VARCHAR(64) | UNIQUE, NOT NULL | 申请登录名 |
| password_hash | VARCHAR(256) | NOT NULL | |
| real_name | VARCHAR(128) | | |
| email | VARCHAR(128) | | |
| apply_dept_id | BIGINT | FK → sys_dept.id | 申请部门 |
| status | VARCHAR(32) | DEFAULT 'pending' | pending/approved/rejected |
| apply_time | DATETIME | | |
| approved_by | BIGINT | FK → sys_user.id | 审核人 |
| approved_time | DATETIME | | |
| approved_dept_id | BIGINT | FK → sys_dept.id | 审核后分配的部门 |
| reject_reason | VARCHAR(512) | | 拒绝原因 |
| created_at | DATETIME | | |

索引: `idx_status`, `idx_login_name`

---

## 2. 权限点初始化数据

系统初始化的菜单权限点（由系统管理员维护，用户不可修改）：

| code | name | parent_code | perm_type |
|------|------|-------------|-----------|
| explore | 首页 | NULL | menu |
| skills | 技能 | NULL | menu |
| datasources | 数据源 | NULL | menu |
| knowledge | 知识库 | NULL | menu |
| settings | 设置 | NULL | menu |
| settings.app_management | 应用管理 | settings | menu |
| settings.model_manage | 模型管理 | settings | menu |
| settings.awel_workflow | AWEL工作流 | settings | menu |
| settings.prompts | 提示词 | settings | menu |
| settings.dbgpts_community | DBGPTs社区 | settings | menu |
| settings.models_evaluation | 模型评测 | settings | menu |

---

## 3. 超级管理员初始化数据

```sql
-- 初始密码: Admin123! (bcrypt hash)
-- 密码将在 SQL 中预置为 bcrypt hash

INSERT INTO sys_user (user_id, login_name, password_hash, real_name, is_active, is_super_admin, created_at, updated_at)
VALUES ('SUPER_ADMIN', 'admin', '$2b$12$...', '超级管理员', 1, 1, NOW(), NOW());
```

---

## 4. 技术说明

### 4.1 密码加密

使用 `bcrypt` 算法，通过 `passlib` 库实现：

```python
from passlib.hash import bcrypt
hash = bcrypt.hash("Admin123!")
verify = bcrypt.verify("Admin123!", hash)
```

### 4.2 会话管理

使用 `iron-session`（已有基础设施）管理用户登录态：

```typescript
// 已在 web/lib/session.ts 中配置
const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD,
  cookieName: 'dbgpt-portal',
};
```

### 4.3 前端菜单权限控制

根据用户权限列表，动态过滤渲染菜单：

```typescript
// 伪代码
const visibleMenus = allMenus.filter(menu =>
  userPermissions.includes(menu.code)
);
```

---

## 5. SQL 脚本清单

1. `V1__create_sys_dept.sql` - 部门表
2. `V2__create_sys_permission.sql` - 权限表 + 初始化数据
3. `V3__create_sys_role.sql` - 角色表
4. `V4__create_sys_role_permission.sql` - 角色权限关联表
5. `V5__create_sys_user.sql` - 用户表 + 超级管理员初始化
6. `V6__create_sys_user_role.sql` - 用户角色关联表
7. `V7__create_sys_user_registration.sql` - 注册申请表

所有脚本使用 alembic 命名约定，支持顺序执行。
