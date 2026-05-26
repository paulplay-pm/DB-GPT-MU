# 用户菜单设计规范

> **创建日期:** 2026-05-26

## 背景

DB-GPT 需要在左下角用户头像区域增加下拉菜单，提供"个人信息"、"修改密码"、"退出"三个功能。

## UI 布局

### 用户栏位置
- **位置:** 侧边栏底部，左下角
- **展开状态:** 显示头像 + 用户名 + 向下箭头
- **收起状态:** 仅显示头像

### 下拉菜单
- **触发:** 点击头像/用户名区域
- **菜单项（3个）:**
  1. **个人信息** — 左侧图标: 👤 — 点击弹出 Modal 显示用户详细信息
  2. **修改密码** — 左侧图标: 🔒 — 点击弹出 Modal 修改密码
  3. **退出** — 左侧图标: 🚪 — 红色字体，点击清除 session 并跳转登录页

### 模态框
- **个人信息 Modal:** 只读展示用户信息（登录名、真实姓名、邮箱、部门）
- **修改密码 Modal:** 包含原密码、新密码、确认密码三个字段，表单验证

## API 设计

### 退出登录
```
POST /api/v2/sys/auth/logout
- 清除 HttpOnly session cookie
- 前端同时清除 localStorage 中的 STORAGE_USERINFO_KEY
- 前端跳转 /login
```

### 获取当前用户信息
```
GET /api/v2/sys/auth/me
Response: { id, user_id, login_name, real_name, email, dept_id, is_super_admin, permissions }
```

### 更新个人信息（新增）
```
PUT /api/v2/sys/auth/profile
Body: { real_name, email, dept_id }
Response: Result[UserResponse]
```

### 修改密码（新增）
```
PUT /api/v2/sys/auth/password
Body: { old_password, new_password }
Response: Result
- 验证原密码正确性
- 新密码 bcrypt 加密后存入数据库
```

## 文件变更

### 后端
- `packages/dbgpt-serve/src/dbgpt_serve/security/api/auth_endpoints.py` — 新增 `/profile` 和 `/password` 端点
- `packages/dbgpt-serve/src/dbgpt_serve/security/service/auth_service.py` — 新增 `update_profile()` 和 `change_password()` 方法

### 前端
- `web/new-components/layout/UserBar.tsx` — 重构为带下拉菜单的组件
- `web/pages/_app.tsx` — 确保登出时清除 localStorage

## 交互细节

1. **点击空白区域关闭菜单** — 使用 useOnClickOutside 或类似实现
2. **菜单动画** — scale 从 0.95 → 1，opacity 从 0 → 1，150ms ease-out
3. **表单验证** — 修改密码时新密码最少 6 位，两次输入一致
4. **错误提示** — 使用 antd message组件显示后端返回的错误