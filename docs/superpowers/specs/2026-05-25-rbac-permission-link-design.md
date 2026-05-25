# 用户权限管理系统 - 权限关联功能实现

> **Date:** 2026-05-25
> **Status:** Approved for Implementation

## 目标

实现完整的功能级权限控制系统，支持:
- 用户 → 角色 → 权限 链式查询
- 登录时即时计算用户权限
- 权限码集中管理
- 侧边栏菜单和管理后台基于权限动态显示

## 数据模型

### 现有模型
- `sys_user` - 用户表
- `sys_user_role` - 用户角色关联表 (user_id, role_id)
- `sys_role` - 角色表
- `sys_permission` - 权限表 (code, name, parent_id, level, sort)

### 新增模型
- `sys_role_permission` - 角色权限关联表 (role_id, permission_id)

```
sys_user ← sys_user_role → sys_role → sys_role_permission → sys_permission
```

## 实现方案

### 方案选择
- **登录时即时计算**: 用户登录时查询权限链，计算权限列表
- **功能级权限**: 每个菜单/功能对应一个权限码
- **权限码集中管理**: 权限码定义为常量，集中在 `permissions.ts`
- **树形层级**: 按模块分组，用 `.` 分隔 (如 `user.view`)

## 实现任务

### Task 1: 创建角色权限关联表

**文件:**
- `packages/dbgpt-serve/src/dbgpt_serve/security/models/role_permission.py`

**模型:**
```python
class SysRolePermission(Model):
    __tablename__ = "sys_role_permission"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    role_id = Column(BigInteger, ForeignKey("sys_role.id"), nullable=False)
    permission_id = Column(BigInteger, ForeignKey("sys_permission.id"), nullable=False)
```

### Task 2: 扩展 PermissionService 实现权限链式查询

**文件:**
- `packages/dbgpt-serve/src/dbgpt_serve/security/service/permission_service.py`

**新增方法:**
```python
def get_user_permissions(self, user_id: int) -> List[str]:
    """Get user's effective permissions from roles"""
    # 1. 查询用户的角色 IDs
    # 2. 查询角色关联的权限 IDs
    # 3. 查询权限的 code 列表
    return codes
```

### Task 3: 创建权限码常量文件

**文件:**
- `web/utils/constants/permissions.ts`

**内容:**
```typescript
export const PERMISSIONS = {
  USER: {
    VIEW: 'user.view',
    EDIT: 'user.edit',
    MANAGEMENT: 'user.management',
  },
  DEPT: {
    VIEW: 'dept.view',
    EDIT: 'dept.edit',
    MANAGEMENT: 'dept.management',
  },
  ROLE: {
    VIEW: 'role.view',
    EDIT: 'role.edit',
    MANAGEMENT: 'role.management',
  },
  REGISTRATION: {
    VIEW: 'registration.view',
    APPROVE: 'registration.approve',
    REJECT: 'registration.reject',
  },
} as const;

// 所有权限码列表
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap(m =>
  Object.values(m)
);
```

### Task 4: 扩展 AuthService 登录时计算权限

**文件:**
- `packages/dbgpt-serve/src/dbgpt_serve/security/service/auth_service.py`

**修改 `authenticate` 方法:**
```python
def authenticate(self, login_name: str, password: str):
    user = ...
    if is_super_admin:
        user["permissions"] = ["*"]
    else:
        from .permission_service import PermissionService
        ps = PermissionService()
        user["permissions"] = ps.get_user_permissions(user["id"])
    return user
```

### Task 5: 更新 PermissionService 支持角色权限管理

**文件:**
- `packages/dbgpt-serve/src/dbgpt_serve/security/service/permission_service.py`

**新增方法:**
```python
def add_permission_to_role(self, role_id: int, permission_id: int): ...
def remove_permission_from_role(self, role_id: int, permission_id: int): ...
def get_role_permissions(self, role_id: int) -> List[int]: ...
def update_role_permissions(self, role_id: int, permission_ids: List[int]): ...
```

### Task 6: 创建角色权限关联 API

**文件:**
- `packages/dbgpt-serve/src/dbgpt_serve/security/api/role_endpoints.py`

**新增端点:**
```python
@router.put("/roles/{role_id}/permissions", response_model=Result)
async def update_role_permissions(role_id: int, permission_ids: List[int]):
    """Update role's permissions"""
    service = SysRoleService()
    service.update_role_permissions(role_id, permission_ids)
    return Result.succ(None)
```

### Task 7: 侧边栏菜单权限码分配

**文件:**
- `web/components/layout/side-bar.tsx`

**修改:**
```typescript
const menuItems = [
  { key: 'chat', permissionKey: 'chat.view', ... },
  { key: 'skills', permissionKey: 'skills.view', ... },
  // ...
];

// 过滤
return items.filter(item => hasPermission(item.permissionKey));
```

### Task 8: 管理后台菜单权限码分配

**文件:**
- `web/components/layout/side-bar.tsx`

**settingsContent 区域添加管理后台菜单:**
```typescript
{
  key: 'admin_user',
  name: t('user_management'),
  permissionKey: PERMISSIONS.USER.MANAGEMENT,
  path: '/admin/user',
},
{
  key: 'admin_dept',
  name: t('dept_management'),
  permissionKey: PERMISSIONS.DEPT.MANAGEMENT,
  path: '/admin/dept',
},
{
  key: 'admin_role',
  name: t('role_management'),
  permissionKey: PERMISSIONS.ROLE.MANAGEMENT,
  path: '/admin/role',
},
{
  key: 'admin_registration',
  name: t('registration_review'),
  permissionKey: PERMISSIONS.REGISTRATION.APPROVE,
  path: '/admin/registration',
},
```

## 权限码清单

| 权限码 | 说明 |
|--------|------|
| `user.view` | 查看用户列表 |
| `user.edit` | 编辑用户信息 |
| `user.management` | 用户管理(含增删改) |
| `dept.view` | 查看部门 |
| `dept.edit` | 编辑部门信息 |
| `dept.management` | 部门管理(含增删改) |
| `role.view` | 查看角色 |
| `role.edit` | 编辑角色信息 |
| `role.management` | 角色管理(含增删改、关联权限) |
| `registration.view` | 查看注册申请 |
| `registration.approve` | 审核通过 |
| `registration.reject` | 审核拒绝 |

## 实现顺序

1. Task 1: 创建 role_permission 模型
2. Task 2: 实现权限链式查询
3. Task 3: 创建权限码常量
4. Task 4: 修改 AuthService 集成权限计算
5. Task 5: 扩展 PermissionService 支持角色权限管理
6. Task 6: 创建角色权限 API
7. Task 7: 侧边栏菜单权限码分配
8. Task 8: 管理后台菜单权限码分配