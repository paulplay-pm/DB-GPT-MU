# 用户权限管理系统实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的用户权限管理系统，包括部门/角色/用户 CRUD、登录认证、注册审核、菜单权限控制

**Architecture:** 
- 后端: FastAPI Router `/api/v2/sys/*` + SQLAlchemy ORM + BaseDao 模式
- 前端: Next.js 页面 + Ant Design 组件 + iron-session 会话管理
- 密码: bcrypt 加密
- 权限控制: 后端中间件 + 前端菜单动态渲染

**Tech Stack:** Python 3.10+, FastAPI, SQLAlchemy, Pydantic v2, bcrypt, Next.js, React, TypeScript, Ant Design

---

## 文件结构规划

### 后端新增模块

```
packages/dbgpt-serve/src/dbgpt_serve/security/           # 新建 security 模块
├── __init__.py
├── config.py                        # 组件配置
├── models/
│   ├── __init__.py
│   ├── dept.py                     # 部门实体
│   ├── permission.py               # 权限实体
│   ├── role.py                     # 角色实体
│   ├── user.py                     # 用户实体
│   └── registration.py            # 注册申请实体
├── api/
│   ├── __init__.py
│   ├── schemas.py                  # 所有 Pydantic schemas
│   ├── endpoints.py                # 所有 API endpoints (统一入口)
│   ├── auth_endpoints.py           # 登录/登出/注册 endpoints
│   ├── dept_endpoints.py           # 部门管理 endpoints
│   ├── permission_endpoints.py     # 权限查询 endpoints
│   ├── role_endpoints.py           # 角色管理 endpoints
│   ├── user_endpoints.py           # 用户管理 endpoints
│   └── registration_endpoints.py   # 注册审核 endpoints
├── service/
│   ├── __init__.py
│   ├── auth_service.py             # 登录/密码校验服务
│   ├── dept_service.py            # 部门服务
│   ├── role_service.py             # 角色服务
│   ├── user_service.py            # 用户服务
│   └── registration_service.py     # 注册申请服务
├── middleware/
│   ├── __init__.py
│   └── auth_middleware.py         # 权限校验中间件
├── serve.py                        # Serve 组件入口
└── dao/
    ├── __init__.py
    ├── dept_dao.py
    ├── permission_dao.py
    ├── role_dao.py
    ├── user_dao.py
    └── registration_dao.py
```

### 前端新增/修改文件

```
web/
├── pages/
│   ├── login.tsx                  # 新增: 登录页
│   ├── register.tsx                # 新增: 注册申请页
│   └── admin/                     # 新增: 管理后台
│       ├── index.tsx              # 新增: 管理首页
│       ├── dept.tsx               # 新增: 部门管理
│       ├── role.tsx               # 新增: 角色管理
│       ├── user.tsx               # 新增: 用户管理
│       └── registration.tsx       # 新增: 注册审核
├── client/api/
│   ├── sys/
│   │   ├── index.ts               # 新增: sys 模块入口
│   │   ├── auth.ts                # 新增: 登录登出API
│   │   ├── dept.ts                # 新增: 部门API
│   │   ├── role.ts                # 新增: 角色API
│   │   ├── user.ts                # 新增: 用户API
│   │   └── permission.ts          # 新增: 权限API
│   └── registration.ts            # 新增: 注册API
├── types/
│   ├── user.ts                    # 新增: 用户类型定义
│   ├── dept.ts                    # 新增: 部门类型
│   ├── role.ts                    # 新增: 角色类型
│   ├── permission.ts              # 新增: 权限类型
│   └── registration.ts            # 新增: 注册类型
├── context/
│   ├── AuthContext.tsx            # 新增: 认证上下文
│   └── PermissionContext.tsx      # 新增: 权限上下文
├── components/
│   └── admin/                     # 新增: 管理组件
│       ├── DeptTree.tsx
│       ├── RolePermissionSelect.tsx
│       ├── UserTable.tsx
│       └── RegistrationTable.tsx
└── app/
    └── chat-context.tsx            # 修改: 添加认证状态
```

---

## 阶段一: 认证优先 (Task 5 → Task 7 → Task 11 → Task 10 → Task 12)

### Task 1: 创建 security 模块基础结构

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/__init__.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/config.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/serve.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/models/__init__.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/dao/__init__.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/service/__init__.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/middleware/__init__.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/api/__init__.py`

- [ ] **Step 1: 创建目录结构和空 `__init__.py` 文件**

```bash
mkdir -p packages/dbgpt-serve/src/dbgpt_serve/security/{models,dao,service,middleware,api}
touch packages/dbgpt-serve/src/dbgpt_serve/security/__init__.py
touch packages/dbgpt-serve/src/dbgpt_serve/security/models/__init__.py
touch packages/dbgpt-serve/src/dbgpt_serve/security/dao/__init__.py
touch packages/dbgpt-serve/src/dbgpt_serve/security/service/__init__.py
touch packages/dbgpt-serve/src/dbgpt_serve/security/middleware/__init__.py
touch packages/dbgpt-serve/src/dbgpt_serve/security/api/__init__.py
```

- [ ] **Step 2: 创建 config.py**

```python
from typing import Optional, List

SERVE_APP_NAME = "dbgpt_serve_security"
SERVE_APP_NAME_HUMP = "Security"
SERVE_CONFIG_KEY_PREFIX = "SECURITY"
SERVE_SERVICE_COMPONENT_NAME = "dbgpt_serve_security_service"


class ServeConfig:
    """Security service configuration"""
    
    def __init__(
        self,
        api_keys: Optional[List[str]] = None,
    ):
        self.api_keys = api_keys or []
    
    @classmethod
    def from_app_config(cls, config, prefix: str = SERVE_CONFIG_KEY_PREFIX):
        """Load config from app config"""
        api_keys = getattr(config, f"{prefix}_api_keys", None)
        return cls(api_keys=api_keys)
```

- [ ] **Step 3: 创建 serve.py (参考 `dbgpt_serve/datasource/serve.py`)**

```python
import logging
from typing import List, Optional, Union
from sqlalchemy import URL

from dbgpt.component import SystemApp
from dbgpt.storage.metadata import DatabaseManager
from dbgpt_serve.core import BaseServe

from .api.endpoints import init_endpoints, router
from .config import SERVE_APP_NAME, SERVE_APP_NAME_HUMP, SERVE_CONFIG_KEY_PREFIX, ServeConfig

logger = logging.getLogger(__name__)


class SecurityServe(BaseServe):
    """Security serve component for user permission system"""

    name = SERVE_APP_NAME

    def __init__(
        self,
        system_app: SystemApp,
        config: Optional[ServeConfig] = None,
        api_prefix: Optional[str] = "/api/v2/sys",
        api_tags: Optional[List[str]] = None,
        db_url_or_db: Union[str, URL, DatabaseManager] = None,
        try_create_tables: Optional[bool] = False,
    ):
        if api_tags is None:
            api_tags = [SERVE_APP_NAME_HUMP]
        super().__init__(
            system_app, api_prefix, api_tags, db_url_or_db, try_create_tables
        )
        self._db_manager: Optional[DatabaseManager] = None
        self._config = config

    def init_app(self, system_app: SystemApp):
        if self._app_has_initiated:
            return
        self._system_app = system_app
        self._system_app.app.include_router(
            router, prefix=self._api_prefix, tags=self._api_tags
        )
        self._config = self._config or ServeConfig.from_app_config(
            system_app.config, SERVE_CONFIG_KEY_PREFIX
        )
        init_endpoints(self._system_app, self._config)
        self._app_has_initiated = True
```

- [ ] **Step 4: 创建 api/__init__.py (空的初始化文件)**

```python
# API module
```

- [ ] **Step 5: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/
git commit -m "feat(security): add security module base structure"
```

---

### Task 2: 创建数据模型 (sys_user)

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/models/user.py`
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/models/__init__.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/dao/user_dao.py`
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/dao/__init__.py`

- [ ] **Step 1: 创建 user.py 模型实体 (参考 `dbgpt_serve/agent/db/gpts_app.py` 的 Entity 模式)**

```python
from datetime import datetime
from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Boolean

from dbgpt.storage.metadata import Model


class SysUser(Model):
    """System user entity - mirrors the sys_user table"""
    
    __tablename__ = "sys_user"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(String(64), nullable=False, unique=True)  # 关联其他模块
    login_name = Column(String(64), nullable=False, unique=True)  # 登录名
    password_hash = Column(String(256), nullable=False)  # bcrypt hash
    real_name = Column(String(128), nullable=True)
    email = Column(String(128), nullable=True)
    dept_id = Column(BigInteger, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_super_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
```

- [ ] **Step 2: 创建 user_dao.py (参考 BaseDao 模式)**

```python
from typing import Optional
from dbgpt.storage.metadata import BaseDao
from .user import SysUser


class SysUserDao(BaseDao):
    """DAO for sys_user table"""
    
    def get_by_login_name(self, login_name: str) -> Optional[SysUser]:
        with self.session() as session:
            return session.query(SysUser).filter(
                SysUser.login_name == login_name
            ).first()
    
    def get_by_user_id(self, user_id: str) -> Optional[SysUser]:
        with self.session() as session:
            return session.query(SysUser).filter(
                SysUser.user_id == user_id
            ).first()
    
    def get_by_id(self, id: int) -> Optional[SysUser]:
        with self.session() as session:
            return session.query(SysUser).filter(SysUser.id == id).first()
```

- [ ] **Step 3: 更新 models/__init__.py 和 dao/__init__.py**

```python
# models/__init__.py
from .user import SysUser

__all__ = ["SysUser"]
```

- [ ] **Step 4: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/
git commit -m "feat(security): add SysUser model and DAO"
```

---

### Task 3: 创建 auth_service (Task 5 核心)

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/service/auth_service.py`
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/service/__init__.py`

- [ ] **Step 1: 创建 auth_service.py (包含密码校验)**

```python
import bcrypt
from typing import Optional, Tuple
from .user_service import SysUserService


class AuthService:
    """Authentication service for login/logout"""
    
    def __init__(self):
        self._user_service = SysUserService()
    
    def verify_password(self, raw_password: str, password_hash: str) -> bool:
        """Verify password against bcrypt hash"""
        return bcrypt.checkpw(
            raw_password.encode('utf-8'),
            password_hash.encode('utf-8')
        )
    
    def hash_password(self, password: str) -> str:
        """Hash password with bcrypt"""
        return bcrypt.hashpw(
            password.encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
    
    def authenticate(self, login_name: str, password: str) -> Tuple[Optional[dict], Optional[str]]:
        """
        Authenticate user by login_name and password.
        Returns (user_dict, error_message)
        """
        user = self._user_service.get_user_by_login_name(login_name)
        if not user:
            return None, "用户名或密码错误"
        
        if not user.is_active:
            return None, "账户已被禁用"
        
        if not self.verify_password(password, user.password_hash):
            return None, "用户名或密码错误"
        
        return self._user_to_dict(user), None
    
    def _user_to_dict(self, user) -> dict:
        """Convert user entity to dict (without password_hash)"""
        return {
            "id": user.id,
            "user_id": user.user_id,
            "login_name": user.login_name,
            "real_name": user.real_name,
            "email": user.email,
            "dept_id": user.dept_id,
            "is_active": user.is_active,
            "is_super_admin": user.is_super_admin,
        }
```

- [ ] **Step 2: 创建 user_service.py (基础用户服务)**

```python
from typing import Optional
from ..dao.user_dao import SysUserDao
from ..models.user import SysUser


class SysUserService:
    """Service for sys_user operations"""
    
    def __init__(self):
        self._dao = SysUserDao()
    
    def get_user_by_login_name(self, login_name: str) -> Optional[SysUser]:
        return self._dao.get_by_login_name(login_name)
    
    def get_user_by_id(self, id: int) -> Optional[SysUser]:
        return self._dao.get_by_id(id)
```

- [ ] **Step 3: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/service/
git commit -m "feat(security): add AuthService with password verification"
```

---

### Task 4: 创建登录 API endpoints (Task 5)

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/api/schemas.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/api/auth_endpoints.py`
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/api/endpoints.py`

- [ ] **Step 1: 创建 schemas.py (Pydantic 请求/响应模型)**

```python
from pydantic import BaseModel
from typing import Optional


class LoginRequest(BaseModel):
    """Login request schema"""
    login_name: str
    password: str


class LoginResponse(BaseModel):
    """Login response schema"""
    id: int
    user_id: str
    login_name: str
    real_name: Optional[str]
    email: Optional[str]
    is_super_admin: bool
    permissions: list[str] = []  # permission codes


class CurrentUserResponse(BaseModel):
    """Current user info response"""
    id: int
    user_id: str
    login_name: str
    real_name: Optional[str]
    email: Optional[str]
    dept_id: Optional[int]
    is_super_admin: bool
    permissions: list[str] = []
```

- [ ] **Step 2: 创建 auth_endpoints.py (登录/登出/当前用户 API)**

```python
from fastapi import APIRouter, HTTPException, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .schemas import LoginRequest, LoginResponse, CurrentUserResponse
from ..service.auth_service import AuthService
from ...core import Result

router = APIRouter()
auth_service = AuthService()
bearer_scheme = HTTPBearer(auto_error=False)


def create_session(response: Response, user_data: dict):
    """Create session cookie after successful login"""
    response.set_cookie(
        key="session",
        value=json.dumps(user_data),
        httponly=True,
        max_age=86400 * 7,  # 7 days
        samesite="lax"
    )


@router.post("/login", response_model=Result[LoginResponse])
async def login(request: LoginRequest, response: Response):
    """
    Login endpoint - POST /api/v2/sys/login
    
    Request body:
    - login_name: str
    - password: str
    
    Returns user info with permissions on success.
    Sets session cookie on success.
    """
    user, error = auth_service.authenticate(request.login_name, password)
    if error:
        raise HTTPException(status_code=401, detail=error)
    
    # Get user permissions from role-based access control
    from ..service.permission_service import PermissionService
    permission_service = PermissionService()
    user["permissions"] = permission_service.get_user_permissions(user["id"])
    
    create_session(response, user)
    return Result.succ(LoginResponse(**user))


@router.post("/logout", response_model=Result)
async def logout(request: Request, response: Response):
    """Logout endpoint - clears session cookie"""
    response.delete_cookie("session")
    return Result.succ(None)


@router.get("/me", response_model=Result[CurrentUserResponse])
async def get_current_user(request: Request):
    """Get current logged in user info"""
    session_data = request.cookies.get("session")
    if not session_data:
        raise HTTPException(status_code=401, detail="Not logged in")
    
    import json
    user_data = json.loads(session_data)
    return Result.succ(CurrentUserResponse(**user_data))
```

- [ ] **Step 3: 创建 endpoints.py (路由聚合)**

```python
from fastapi import APIRouter
from .auth_endpoints import router as auth_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["认证"])
```

- [ ] **Step 4: 创建 api/__init__.py**

```python
from .endpoints import router
from .schemas import LoginRequest, LoginResponse, CurrentUserResponse

__all__ = ["router", "LoginRequest", "LoginResponse", "CurrentUserResponse"]
```

- [ ] **Step 5: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/api/
git commit -m "feat(security): add login/logout API endpoints"
```

---

### Task 5: 集成 security 模块到应用

**Files:**
- Modify: `packages/dbgpt-app/src/dbgpt_app/dbgpt_server.py`
- Modify: `packages/dbgpt-app/src/dbgpt_app/component_configs.py`

- [ ] **Step 1: 查看现有 dbgpt_server.py 了解如何注册 Serve 组件**

```python
# 参考现有模式添加 SecurityServe
from dbgpt_serve.security import SecurityServe

# 在初始化阶段注册
security_serve = SecurityServe(system_app)
security_serve.init_app(system_app)
```

- [ ] **Step 2: Commit**

```bash
git add packages/dbgpt-app/src/dbgpt_app/
git commit -m "feat(security): integrate security module into app"
```

---

### Task 6: 前端登录页面 (Task 7)

**Files:**
- Create: `web/pages/login.tsx`
- Create: `web/client/api/sys/auth.ts`
- Create: `web/types/auth.ts`
- Modify: `web/client/api/index.ts`

- [ ] **Step 1: 创建前端登录页 (web/pages/login.tsx)**

```typescript
import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

interface LoginForm {
  login_name: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v2/sys/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',  // 重要: 发送 cookie
      });
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('user_info', JSON.stringify(data.data));
        message.success('登录成功');
        router.push('/');
      } else {
        message.error(data.detail || '登录失败');
      }
    } catch (e) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card title="DB-GPT 登录" style={{ width: 400 }}>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="login_name"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="密码" 
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/register">没有账号？立即注册</a>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/pages/login.tsx
git commit -m "feat(frontend): add login page"
```

---

### Task 7: 前端路由守卫 (Task 11)

**Files:**
- Modify: `web/pages/_app.tsx`

- [ ] **Step 1: 修改 _app.tsx 添加路由守卫逻辑**

```typescript
// 在 LayoutWrapper 组件中添加:
useEffect(() => {
  const checkAuth = () => {
    const sessionData = document.cookie.includes('session=');
    const userInfo = localStorage.getItem('user_info');
    
    if (!sessionData && !userInfo && router.pathname !== '/login' && router.pathname !== '/register') {
      router.push('/login');
    }
    
    if ((sessionData || userInfo) && router.pathname === '/login') {
      router.push('/');
    }
  };
  
  checkAuth();
}, [router.pathname]);
```

- [ ] **Step 2: Commit**

```bash
git add web/pages/_app.tsx
git commit -m "feat(frontend): add route guard for authentication"
```

---

### Task 8: 前端菜单权限控制 (Task 10)

**Files:**
- Modify: `web/components/layout/side-bar.tsx`
- Create: `web/context/PermissionContext.tsx`

- [ ] **Step 1: 创建 PermissionContext.tsx**

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PermissionContextType {
  permissions: string[];
  hasPermission: (code: string) => boolean;
  setPermissions: (perms: string[]) => void;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  hasPermission: () => false,
  setPermissions: () => {},
});

export const usePermission = () => useContext(PermissionContext);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    // 从登录响应或 cookie 获取权限列表
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setPermissions(user.permissions || []);
    }
  }, []);

  const hasPermission = (code: string) => {
    // 超级管理员拥有所有权限
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    if (userInfo.is_super_admin) return true;
    return permissions.includes(code);
  };

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, setPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}
```

- [ ] **Step 2: 修改 side-bar.tsx 根据权限过滤菜单**

```typescript
// 在 functions useMemo 中添加权限过滤:
const { hasPermission } = usePermission();

const functions = useMemo(() => {
  const items: RouteItem[] = [
    // ... 原有菜单定义
  ];
  
  // 根据权限过滤
  return items.filter(item => hasPermission(item.key));
}, [t, pathname, hasPermission]);
```

- [ ] **Step 3: Commit**

```bash
git add web/context/PermissionContext.tsx web/components/layout/side-bar.tsx
git commit -m "feat(frontend): add menu permission control"
```

---

### Task 9: 后端权限校验中间件 (Task 12)

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/middleware/auth_middleware.py`
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/api/endpoints.py`

- [ ] **Step 1: 创建权限校验函数**

```python
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPCookie
from typing import Optional
import json


security = HTTPBearer(auto_error=False)
cookie_auth = HTTPCookie()


async def get_current_user_from_request(request: Request) -> dict:
    """
    Extract current user from request cookie or header.
    Raises 401 if not authenticated.
    """
    # 优先从 cookie 获取 session
    session_cookie = request.cookies.get("session")
    if session_cookie:
        try:
            return json.loads(session_cookie)
        except json.JSONDecodeError:
            pass
    
    # Fallback: 从 Authorization header 获取 Bearer token
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            return json.loads(token)  # 简单实现: token 直接是 JSON
        except json.JSONDecodeError:
            pass
    
    raise HTTPException(status_code=401, detail="Not authenticated")


async def require_permission(request: Request, required_permission: str):
    """
    Check if current user has the required permission.
    Super admin bypasses all permission checks.
    Raises 403 if not authorized.
    """
    user = await get_current_user_from_request(request)
    
    if user.get("is_super_admin"):
        return user
    
    user_permissions = user.get("permissions", [])
    if required_permission not in user_permissions:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    return user
```

- [ ] **Step 2: 为需要权限的 endpoints 添加依赖**

```python
# 在 auth_endpoints.py 中:
from ..middleware.auth_middleware import get_current_user_from_request, require_permission

# 示例 - 获取当前用户:
@router.get("/me")
async def get_me(request: Request):
    user = await get_current_user_from_request(request)
    return Result.succ(user)

# 示例 - 需要特定权限:
@router.get("/dept")
async def list_depts(request: Request):
    await require_permission(request, "settings.dept_management")
    # ... 业务逻辑
```

- [ ] **Step 3: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/middleware/
git commit -m "feat(security): add permission check middleware"
```

---

## 阶段二: 管理功能

### Task 10: 部门管理 (Task 1)

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/models/dept.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/dao/dept_dao.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/service/dept_service.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/api/dept_endpoints.py`
- Create: `web/pages/admin/dept.tsx`

- [ ] **Step 1-5: 参考 Task 2-4 的模式实现部门 CRUD**

```python
# models/dept.py
from sqlalchemy import Column, BigInteger, String, Integer, Boolean, DateTime, ForeignKey
from dbgpt.storage.metadata import Model

class SysDept(Model):
    __tablename__ = "sys_dept"
    
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String(64), nullable=False)
    name = Column(String(128), nullable=False)
    parent_id = Column(BigInteger, ForeignKey("sys_dept.id"), nullable=True)
    level = Column(Integer, default=1)
    sort = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
```

- [ ] **Step 6: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/ web/pages/admin/dept.tsx
git commit -m "feat(security): add department management"
```

---

### Task 11: 权限管理 API (Task 2 - 只读)

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/models/permission.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/dao/permission_dao.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/service/permission_service.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/api/permission_endpoints.py`

- [ ] **Step 1-4: 实现只读权限查询 API**

```python
# permission_endpoints.py
@router.get("/permissions", response_model=Result[list])
async def list_permissions():
    """Get all permission points (read-only, no create/update/delete)"""
    service = PermissionService()
    permissions = service.get_all_permissions_tree()
    return Result.succ(permissions)
```

- [ ] **Step 5: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/permission*
git commit -m "feat(security): add permission query API (read-only)"
```

---

### Task 12: 角色管理 (Task 3)

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/models/role.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/dao/role_dao.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/service/role_service.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/api/role_endpoints.py`

- [ ] **Step 1-4: 实现角色 CRUD + 权限关联**

```python
# role_endpoints.py
@router.post("/roles", response_model=Result)
async def create_role(request: RoleCreateRequest):
    """Create new role"""
    service = RoleService()
    role = service.create_role(request)
    return Result.succ(role)

@router.get("/roles", response_model=Result[list])
async def list_roles():
    """List all roles"""
    service = RoleService()
    return Result.succ(service.list_roles())

@router.put("/roles/{role_id}/permissions", response_model=Result)
async def update_role_permissions(role_id: int, permission_ids: list[int]):
    """Update role's permissions"""
    service = RoleService()
    service.update_role_permissions(role_id, permission_ids)
    return Result.succ(None)
```

- [ ] **Step 5: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/role*
git commit -m "feat(security): add role management API"
```

---

### Task 13: 用户管理 (Task 4)

**Files:**
- Extend: `packages/dbgpt-serve/src/dbgpt_serve/security/service/user_service.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/api/user_endpoints.py`
- Create: `web/pages/admin/user.tsx`

- [ ] **Step 1-3: 实现用户 CRUD + 角色关联 + 权限获取**

```python
# user_endpoints.py
@router.get("/users", response_model=Result[list])
async def list_users(page: int = 1, page_size: int = 20):
    """List users with pagination"""
    service = SysUserService()
    return Result.succ(service.list_users(page, page_size))

@router.put("/users/{user_id}/roles", response_model=Result)
async def update_user_roles(user_id: int, role_ids: list[int]):
    """Update user's roles"""
    service = SysUserService()
    service.update_user_roles(user_id, role_ids)
    return Result.succ(None)

@router.get("/users/{user_id}/permissions", response_model=Result[list])
async def get_user_permissions(user_id: int):
    """Get user's effective permissions (from roles)"""
    service = SysUserService()
    return Result.succ(service.get_user_permissions(user_id))
```

- [ ] **Step 4: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/user* web/pages/admin/user.tsx
git commit -m "feat(security): add user management API"
```

---

### Task 14: 注册申请与审核 (Task 6)

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/models/registration.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/dao/registration_dao.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/service/registration_service.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/security/api/registration_endpoints.py`
- Create: `web/pages/register.tsx`
- Create: `web/pages/admin/registration.tsx`

- [ ] **Step 1: 创建注册申请提交 API (公开)**
```python
@router.post("/register", response_model=Result)
async def submit_registration(request: RegisterRequest):
    """Submit registration application (public endpoint)"""
    service = RegistrationService()
    service.create_application(request)
    return Result.succ({"message": "申请已提交，请等待审核"})
```

- [ ] **Step 2: 创建管理员审核 API (需权限)**
```python
@router.post("/registrations/{id}/approve", response_model=Result)
async def approve_registration(id: int, request: ApproveRequest):
    """Approve registration and create user"""
    await require_permission(request, "admin.registration.approve")
    service = RegistrationService()
    service.approve(id, request.dept_id, request.role_ids)
    return Result.succ(None)

@router.post("/registrations/{id}/reject", response_model=Result)
async def reject_registration(id: int, request: RejectRequest):
    """Reject registration"""
    await require_permission(request, "admin.registration.reject")
    service = RegistrationService()
    service.reject(id, request.reason)
    return Result.succ(None)
```

- [ ] **Step 3: 创建注册页面 web/pages/register.tsx**

```typescript
import { useState } from 'react';
import { Form, Input, Button, Card, Select, message } from 'antd';

export default function RegisterPage() {
  const [form] = Form.useForm();
  
  const onFinish = async (values: any) => {
    // 调用注册 API
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
      <Card title="用户注册申请" style={{ width: 500 }}>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item name="login_name" label="登录名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="real_name" label="真实姓名">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>提交申请</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/registration* web/pages/register.tsx web/pages/admin/registration.tsx
git commit -m "feat(security): add registration and approval API + pages"
```

---

## Task 汇总

| # | Task | 阶段 | 状态 |
|---|------|------|------|
| 1 | 创建 security 模块基础结构 | 1 | 待开始 |
| 2 | 创建 SysUser 模型 | 1 | 待开始 |
| 3 | 创建 AuthService | 1 | 待开始 |
| 4 | 创建登录 API endpoints | 1 | 待开始 |
| 5 | 集成 security 模块 | 1 | 待开始 |
| 6 | 前端登录页面 | 1 | 待开始 |
| 7 | 前端路由守卫 | 1 | 待开始 |
| 8 | 前端菜单权限控制 | 1 | 待开始 |
| 9 | 后端权限校验中间件 | 1 | 待开始 |
| 10 | 部门管理 API + 前端 | 2 | 待开始 |
| 11 | 权限查询 API (只读) | 2 | 待开始 |
| 12 | 角色管理 API | 2 | 待开始 |
| 13 | 用户管理 API + 前端 | 2 | 待开始 |
| 14 | 注册申请与审核 | 2 | 待开始 |

---

## 测试策略

每个后端 Task 需包含:
- 单元测试: `packages/dbgpt-serve/src/dbgpt_serve/security/**/tests/`
- API 测试: 使用 pytest-asyncio 测试 endpoints

前端测试:
- E2E: 登录流程、手动测试清单

---

## Spec Coverage 检查

| 需求 | 对应 Task |
|------|-----------|
| 部门管理 (CRUD + 树形) | Task 10 |
| 权限管理 (只读) | Task 11 |
| 角色管理 (CRUD + 关联权限) | Task 12 |
| 用户管理 (CRUD + 关联角色) | Task 13 |
| 登录认证 | Task 4, 6 |
| 注册申请与审核 | Task 14 |
| 前端菜单权限控制 | Task 8 |
| 后端接口权限校验 | Task 9 |
