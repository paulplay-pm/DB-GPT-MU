# 用户注册与权限系统测试设计

> **创建日期:** 2026-05-26

## 背景

DB-GPT 的用户注册与权限系统当前存在数据库模型不匹配问题（已修复），需要完整测试覆盖来验证：
1. 用户注册 → 后台审核 → 审核通过 → 登录 → 权限菜单显示

## 测试用例设计

### 测试用例 1: 用户注册

**前置条件:** 数据库 `sys_user_registration` 表存在，`sys_user` 表存在

**步骤:**
1. POST `/api/v2/sys/register` with `{"login_name":"testuser","password":"Test1234!","real_name":"测试用户","email":"test@example.com"}`
2. 预期: 返回 `{"success":true,"data":{"message":"申请已提交，请等待审核"}}`
3. 数据库 `sys_user_registration` 表新增一条 `status="pending"` 的记录

**预期结果:** 注册申请成功提交，返回待审核状态

---

### 测试用例 2: 后台审核 - 审批注册申请

**前置条件:** 存在一条 `status="pending"` 的注册申请记录 (id=1, login_name="testuser")

**步骤:**
1. POST `/api/v2/sys/registrations/1/approve` with `{"dept_id":1,"role_ids":[]}`
2. 预期: 返回 `{"success":true,"data":{"user_id":1}}`

**预期结果:**
- `sys_user_registration` 表中该记录的 `status` 更新为 `"approved"`
- `sys_user` 表中新增一条用户记录
- 用户可使用注册时的账号密码登录

---

### 测试用例 3: 使用已审核账号登录

**前置条件:** `sys_user` 表中存在 `login_name="testuser"` 且 `is_active=true` 的记录

**步骤:**
1. POST `/api/v2/sys/auth/login` with `{"login_name":"testuser","password":"Test1234!"}`
2. 预期: 返回 `{"success":true,"data":{...user info...}}`
3. 响应头中包含 `session` cookie (HttpOnly)

**预期结果:** 登录成功，返回用户信息，session cookie 被设置

---

### 测试用例 4: 未审核账号登录失败

**前置条件:** `sys_user_registration` 表中有 `status="pending"` 的记录，但 `sys_user` 表中无对应记录

**步骤:**
1. POST `/api/v2/sys/auth/login` with `{"login_name":"pendinguser","password":"Test1234!"}`
2. 预期: 返回 401 错误 `"用户不存在"` 或 `"用户名或密码错误"`

**预期结果:** 登录失败，因为账号还在等待审核，`sys_user` 表中没有记录

---

### 测试用例 5: 退出登录

**前置条件:** 已登录状态 (session cookie 存在)

**步骤:**
1. POST `/api/v2/sys/auth/logout`
2. 预期: session cookie 被清除

**预期结果:** 退出成功，cookie 被删除

---

### 测试用例 6: 个人信息修改

**前置条件:** 已登录状态

**步骤:**
1. PUT `/api/v2/sys/auth/profile` with `{"real_name":"新姓名","email":"new@example.com"}`
2. 预期: 返回更新后的用户信息

**预期结果:** 个人信息更新成功

---

### 测试用例 7: 密码修改

**前置条件:** 已登录状态

**步骤:**
1. PUT `/api/v2/sys/auth/password` with `{"old_password":"Test1234!","new_password":"NewPass123!"}`
2. 预期: `{"success":true}`

**预期结果:** 密码修改成功，使用新密码可正常登录

---

### 测试用例 8: 获取当前用户信息

**前置条件:** 已登录状态

**步骤:**
1. GET `/api/v2/sys/auth/me`
2. 预期: 返回当前登录用户信息

**预期结果:** 返回完整用户信息，包含 permissions

---

## 测试执行方式

使用 curl 或 Postman 手动测试，或编写 pytest 自动化测试脚本。

## 数据库检查 SQL

```sql
-- 检查注册申请表
SELECT * FROM sys_user_registration WHERE login_name='testuser';

-- 检查用户表
SELECT * FROM sys_user WHERE login_name='testuser';
```