# RBAC 权限关联功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现用户→角色→权限链式查询，登录时即时计算权限，菜单基于权限动态显示

**Architecture:** 新增 `sys_role_permission` 关联表，扩展 `PermissionService` 实现权限链式查询，修改 `AuthService` 登录时计算权限，前端集中管理权限码常量并基于权限过滤菜单

**Tech Stack:** Python (SQLAlchemy, FastAPI), TypeScript (Next.js)

---

## 文件结构

**后端新增:**
- `packages/dbgpt-serve/src/dbgpt_serve/security/models/role_permission.py` - 角色权限关联表

**后端修改:**
- `packages/dbgpt-serve/src/dbgpt_serve/security/service/permission_service.py` - 新增 get_user_permissions, add/remove/update_role_permissions 方法
- `packages/dbgpt-serve/src/dbgpt_serve/security/service/auth_service.py` - authenticate 方法调用权限计算
- `packages/dbgpt-serve/src/dbgpt_serve/security/api/role_endpoints.py` - 新增 PUT /roles/{role_id}/permissions 端点
- `packages/dbgpt-serve/src/dbgpt_serve/security/models/__init__.py` - 导出 SysRolePermission
- `packages/dbgpt-serve/src/dbgpt_serve/security/dao/__init__.py` - 导出新的 DAO

**前端新增:**
- `web/utils/constants/permissions.ts` - 权限码常量

**前端修改:**
- `web/components/layout/side-bar.tsx` - 菜单项添加 permissionKey，基于权限过滤

---

## Task 1: 创建角色权限关联表模型

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/models/role_permission.py`
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/models/__init__.py`

- [ ] **Step 1: 创建 role_permission.py**

```python
from sqlalchemy import Column, BigInteger, ForeignKey
from dbgpt.storage.metadata import Model


class SysRolePermission(Model):
    """Role-Permission association table - mirrors the sys_role_permission table"""

    __tablename__ = "sys_role_permission"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    role_id = Column(BigInteger, ForeignKey("sys_role.id"), nullable=False)
    permission_id = Column(BigInteger, ForeignKey("sys_permission.id"), nullable=False)
```

- [ ] **Step 2: 更新 models/__init__.py**

```python
from .user import SysUser
from .dept import SysDept
from .permission import SysPermission
from .role import SysRole
from .user_role import SysUserRole
from .role_permission import SysRolePermission  # NEW
from .registration import SysRegistration

__all__ = [
    "SysUser",
    "SysDept",
    "SysPermission",
    "SysRole",
    "SysUserRole",
    "SysRolePermission",  # NEW
    "SysRegistration",
]
```

- [ ] **Step 3: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/models/
git commit -m "feat(security): add SysRolePermission model for role-permission association"
```

---

## Task 2: 实现权限链式查询

**Files:**
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/service/permission_service.py`

- [ ] **Step 1: 添加 import 和新方法**

在 `permission_service.py` 中添加:

```python
from typing import Optional, List
from ..dao.permission_dao import SysPermissionDao
from ..models.user_role import SysUserRole
from ..models.role_permission import SysRolePermission
from dbgpt.storage.metadata import BaseDao
```

新增方法:

```python
def get_user_permissions(self, user_id: int) -> List[str]:
    """Get user's effective permission codes from roles"""
    base_dao = BaseDao()
    with base_dao.session() as session:
        # 1. 查询用户的角色 IDs
        user_roles = session.query(SysUserRole).filter(
            SysUserRole.user_id == user_id
        ).all()
        role_ids = [ur.role_id for ur in user_roles]
        if not role_ids:
            return []

        # 2. 查询这些角色的所有权限 IDs
        role_perms = session.query(SysRolePermission).filter(
            SysRolePermission.role_id.in_(role_ids)
        ).all()
        perm_ids = [rp.permission_id for rp in role_perms]
        if not perm_ids:
            return []

        # 3. 查询权限 code 列表
        perms = session.query(SysPermission).filter(
            SysPermission.id.in_(perm_ids)
        ).all()
        return [p.code for p in perms]
```

- [ ] **Step 2: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/service/permission_service.py
git commit -m "feat(security): add get_user_permissions method for permission chain query"
```

---

## Task 3: 创建权限码常量文件

**Files:**
- Create: `web/utils/constants/permissions.ts`

- [ ] **Step 1: 创建 permissions.ts**

```typescript
// 权限码常量 - 集中管理所有权限码
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

// 所有权限码列表 (用于权限初始化等场景)
export const ALL_PERMISSION_CODES = Object.values(PERMISSIONS).flatMap(category =>
  Object.values(category)
);

// 权限码类型
export type PermissionCode = typeof ALL_PERMISSION_CODES[number];
```

- [ ] **Step 2: Commit**

```bash
git add web/utils/constants/permissions.ts
git commit -m "feat(frontend): add permission code constants"
```

---

## Task 4: 修改 AuthService 集成权限计算

**Files:**
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/service/auth_service.py`

- [ ] **Step 1: 修改 authenticate 方法**

在 `authenticate` 方法中，找到这段代码:

```python
# Get user permissions - placeholder for now, will be implemented with PermissionService later
# For super admin, grant all permissions
if user.get("is_super_admin"):
    user["permissions"] = ["*"]  # Super admin has all permissions
else:
    user["permissions"] = []  # Will be populated by PermissionService when available
```

替换为:

```python
# Get user permissions via permission chain
if user.get("is_super_admin"):
    user["permissions"] = ["*"]  # Super admin has all permissions
else:
    from .permission_service import PermissionService
    ps = PermissionService()
    user["permissions"] = ps.get_user_permissions(user["id"])
```

- [ ] **Step 2: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/service/auth_service.py
git commit -m "feat(security): integrate permission chain calculation in AuthService"
```

---

## Task 5: 扩展 PermissionService 支持角色权限管理

**Files:**
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/service/permission_service.py`

- [ ] **Step 1: 添加角色权限管理方法**

在 `SysPermissionService` 类中添加:

```python
def get_role_permissions(self, role_id: int) -> List[int]:
    """Get permission IDs for a role"""
    base_dao = BaseDao()
    with base_dao.session() as session:
        role_perms = session.query(SysRolePermission).filter(
            SysRolePermission.role_id == role_id
        ).all()
        return [rp.permission_id for rp in role_perms]

def add_permission_to_role(self, role_id: int, permission_id: int):
    """Add permission to role"""
    base_dao = BaseDao()
    with base_dao.session() as session:
        # Check if already exists
        existing = session.query(SysRolePermission).filter(
            SysRolePermission.role_id == role_id,
            SysRolePermission.permission_id == permission_id
        ).first()
        if not existing:
            rp = SysRolePermission(role_id=role_id, permission_id=permission_id)
            session.add(rp)

def remove_permission_from_role(self, role_id: int, permission_id: int):
    """Remove permission from role"""
    base_dao = BaseDao()
    with base_dao.session() as session:
        session.query(SysRolePermission).filter(
            SysRolePermission.role_id == role_id,
            SysRolePermission.permission_id == permission_id
        ).delete()

def update_role_permissions(self, role_id: int, permission_ids: List[int]):
    """Update role's permissions (replace all)"""
    base_dao = BaseDao()
    with base_dao.session() as session:
        # Delete existing
        session.query(SysRolePermission).filter(
            SysRolePermission.role_id == role_id
        ).delete()
        # Add new
        for perm_id in permission_ids:
            session.add(SysRolePermission(role_id=role_id, permission_id=perm_id))
```

- [ ] **Step 2: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/service/permission_service.py
git commit -m "feat(security): add role permission management methods"
```

---

## Task 6: 创建角色权限更新 API

**Files:**
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/api/role_endpoints.py`

- [ ] **Step 1: 添加 PUT endpoint**

在 `role_endpoints.py` 中添加:

```python
@router.put("/roles/{role_id}/permissions", response_model=Result)
async def update_role_permissions(role_id: int, permission_ids: List[int]):
    """Update role's permissions (replace all)"""
    from ..service.permission_service import SysPermissionService
    service = SysPermissionService()
    service.update_role_permissions(role_id, permission_ids)
    return Result.succ(None)
```

- [ ] **Step 2: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/api/role_endpoints.py
git commit -m "feat(security): add PUT /roles/{role_id}/permissions endpoint"
```

---

## Task 7: 侧边栏菜单权限码分配

**Files:**
- Modify: `web/components/layout/side-bar.tsx`

- [ ] **Step 1: 导入权限常量**

在文件顶部添加:

```typescript
import { PERMISSIONS } from '@/utils/constants/permissions';
```

- [ ] **Step 2: 修改 mainItems 添加 permissionKey**

找到 mainItems 定义，修改为:

```typescript
const mainItems = [
  {
    key: 'chat',
    name: t('chat'),
    permissionKey: 'chat.view',  // placeholder for main chat feature
    iconSrc: '/pictures/logo.png',
    activeIconSrc: '/pictures/logo.png',
    path: '/',
  },
  {
    key: 'skills',
    name: t('skills'),
    permissionKey: 'skills.view',  // placeholder
    iconSrc: '/pictures/skills.svg',
    activeIconSrc: '/pictures/skills_active.svg',
    path: '/construct/skills',
  },
  {
    key: 'datasources',
    name: t('datasources'),
    permissionKey: 'datasources.view',  // placeholder
    iconSrc: '/pictures/datasource.svg',
    activeIconSrc: '/pictures/datasource_active.svg',
    path: '/construct/database',
  },
  {
    key: 'knowledge',
    name: t('knowledge'),
    permissionKey: 'knowledge.view',  // placeholder
    iconSrc: '/pictures/knowledge_sidebar.svg',
    activeIconSrc: '/pictures/knowledge_sidebar_active.svg',
    path: '/construct/knowledge',
  },
];
```

- [ ] **Step 3: 修改权限过滤逻辑**

找到:

```typescript
// 根据权限过滤
return items.filter(item => hasPermission(item.key));
```

替换为:

```typescript
// 根据权限过滤
return items.filter(item => {
  // 如果没有 permissionKey，默认允许访问
  if (!item.permissionKey) return true;
  return hasPermission(item.permissionKey);
});
```

- [ ] **Step 4: Commit**

```bash
git add web/components/layout/side-bar.tsx
git commit -m "feat(frontend): add permissionKey to sidebar menu items"
```

---

## Task 8: 管理后台菜单权限码分配

**Files:**
- Modify: `web/components/layout/side-bar.tsx`

- [ ] **Step 1: 修改 settingsContent 添加权限控制**

在 settingsContent 的管理菜单区域，每个菜单项添加权限控制:

```typescript
const settingsContent = (
  <div className='w-56 py-1'>
    <div className='px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider'>{t('management')}</div>
    {hasPermission(PERMISSIONS.USER.MANAGEMENT) && (
      <div
        onClick={() => {
          router.push('/admin/user');
          setSettingsOpen(false);
        }}
        className={cls(...)}
      >
        <AppstoreOutlined className='text-blue-500' />
        <span>{t('user_management')}</span>
      </div>
    )}
    {hasPermission(PERMISSIONS.DEPT.MANAGEMENT) && (
      <div
        onClick={() => {
          router.push('/admin/dept');
          setSettingsOpen(false);
        }}
        className={cls(...)}
      >
        <ApartmentOutlined className='text-green-500' />
        <span>{t('dept_management')}</span>
      </div>
    )}
    {hasPermission(PERMISSIONS.ROLE.MANAGEMENT) && (
      <div
        onClick={() => {
          router.push('/admin/role');
          setSettingsOpen(false);
        }}
        className={cls(...)}
      >
        <KeyOutlined className='text-orange-500' />
        <span>{t('role_management')}</span>
      </div>
    )}
    {hasPermission(PERMISSIONS.REGISTRATION.APPROVE) && (
      <div
        onClick={() => {
          router.push('/admin/registration');
          setSettingsOpen(false);
        }}
        className={cls(...)}
      >
        <UserAddOutlined className='text-purple-500' />
        <span>{t('registration_review')}</span>
      </div>
    )}
  </div>
);
```

**注意:** 需要导入 `KeyOutlined` 和 `UserAddOutlined` 图标。

- [ ] **Step 2: 添加图标导入**

在图标导入处添加:

```typescript
import {
  ApartmentOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  GlobalOutlined,
  KeyOutlined,       // NEW
  LineChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MessageOutlined,
  PlusOutlined,
  RightOutlined,
  UserAddOutlined,   // NEW
} from '@ant-design/icons';
```

- [ ] **Step 3: Commit**

```bash
git add web/components/layout/side-bar.tsx
git commit -m "feat(frontend): add admin menu permission control to sidebar"
```

---

## 验证步骤

1. **后端验证:**
```bash
source .venv/bin/activate
python -c "from dbgpt_serve.security.service.permission_service import SysPermissionService; print('OK')"
python -c "from dbgpt_serve.security.service.auth_service import AuthService; print('OK')"
```

2. **前端验证:**
```bash
cd web && npx tsc --noEmit
yarn compile
```

3. **手动测试:**
- 创建用户、角色、权限数据
- 分配权限给角色，角色分配给用户
- 登录验证权限计算是否正确
- 验证菜单根据权限显示/隐藏