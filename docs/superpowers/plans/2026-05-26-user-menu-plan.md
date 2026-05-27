# User Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dropdown menu to user avatar with profile view, password change, and logout functionality.

**Architecture:** Backend adds two new auth endpoints (PUT /profile, PUT /password) with corresponding service methods. Frontend rewrites UserBar with dropdown menu and three actions.

**Tech Stack:** FastAPI (backend), React + Ant Design (frontend), bcrypt (password hashing)

---

## Task 1: Backend — Add profile update endpoint

**Files:**
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/service/auth_service.py`
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/security/api/auth_endpoints.py:43-58`

- [ ] **Step 1: Add `update_profile()` method to AuthService**

Add after line 62 in `auth_service.py`:

```python
def update_profile(self, user_id: int, real_name: str, email: str, dept_id: Optional[int]) -> Optional[dict]:
    """Update user profile"""
    user = self._user_service.get_user_by_id(user_id)
    if not user:
        return None

    self._user_service.update_user(
        user_id,
        real_name=real_name if real_name else user.real_name,
        email=email if email else user.email,
        dept_id=dept_id if dept_id is not None else user.dept_id,
    )
    return {
        "id": int(user.id),
        "user_id": str(user.user_id),
        "login_name": str(user.login_name),
        "real_name": str(real_name) if real_name else str(user.real_name or ""),
        "email": str(email) if email else str(user.email or ""),
        "dept_id": int(dept_id) if dept_id is not None else (int(user.dept_id) if user.dept_id else None),
        "is_active": bool(user.is_active),
        "is_super_admin": bool(user.is_super_admin),
    }
```

- [ ] **Step 2: Add `change_password()` method to AuthService**

Add after `update_profile()`:

```python
def change_password(self, user_id: int, old_password: str, new_password: str) -> Tuple[bool, Optional[str]]:
    """Change user password. Returns (success, error_message)"""
    user = self._user_service.get_user_by_id(user_id)
    if not user:
        return False, "用户不存在"

    if not self.verify_password(old_password, user.password_hash):
        return False, "原密码错误"

    new_hash = self.hash_password(new_password)
    self._user_service.update_user(user_id, password_hash=new_hash)
    return True, None
```

- [ ] **Step 3: Add schemas for profile update and password change**

Add to `packages/dbgpt-serve/src/dbgpt_serve/security/api/schemas.py` after line 32:

```python
class ProfileUpdateRequest(BaseModel):
    """Update profile request"""
    real_name: Optional[str] = None
    email: Optional[str] = None
    dept_id: Optional[int] = None


class PasswordChangeRequest(BaseModel):
    """Change password request"""
    old_password: str
    new_password: str
```

- [ ] **Step 4: Add new endpoints to auth_endpoints.py**

Add after the `/me` endpoint (after line 57):

```python
@router.put("/profile", response_model=Result[CurrentUserResponse])
async def update_profile(request: Request, body: ProfileUpdateRequest):
    """Update current user's profile"""
    session_data = request.cookies.get("session")
    if not session_data:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_data = json.loads(session_data)
    updated_user, error = auth_service.update_profile(
        user_id=user_data["id"],
        real_name=body.real_name,
        email=body.email,
        dept_id=body.dept_id,
    )
    if error:
        raise HTTPException(status_code=400, detail=error)
    return Result.succ(CurrentUserResponse(**updated_user))


@router.put("/password", response_model=Result)
async def change_password(request: Request, body: PasswordChangeRequest):
    """Change current user's password"""
    session_data = request.cookies.get("session")
    if not session_data:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_data = json.loads(session_data)
    success, error = auth_service.change_password(
        user_id=user_data["id"],
        old_password=body.old_password,
        new_password=body.new_password,
    )
    if not success:
        raise HTTPException(status_code=400, detail=error)
    return Result.succ(None)
```

- [ ] **Step 5: Add import for new schemas**

In `auth_endpoints.py`, update the import from `.schemas` to include new schemas:

```python
from .schemas import LoginRequest, LoginResponse, CurrentUserResponse, ProfileUpdateRequest, PasswordChangeRequest
```

- [ ] **Step 6: Commit**

```bash
git add packages/dbgpt-serve/src/dbgpt_serve/security/service/auth_service.py
git add packages/dbgpt-serve/src/dbgpt_serve/security/api/auth_endpoints.py
git add packages/dbgpt-serve/src/dbgpt_serve/security/api/schemas.py
git commit -m "feat(security): add profile update and password change endpoints"
```

---

## Task 2: Frontend — Rewrite UserBar with dropdown menu

**Files:**
- Modify: `web/new-components/layout/UserBar.tsx`

- [ ] **Step 1: Rewrite UserBar component**

Replace the entire file content with:

```tsx
import { Avatar, Dropdown, MenuProps, message } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { STORAGE_USERINFO_KEY } from '@/utils/constants/storage';

interface UserInfo {
  id?: number;
  login_name?: string;
  real_name?: string;
  nick_name?: string;
  email?: string;
  avatar_url?: string;
}

export default function UserBar({ onlyAvatar = false }: { onlyAvatar?: boolean }) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_USERINFO_KEY);
    if (stored) {
      try {
        setUserInfo(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/v2/sys/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_USERINFO_KEY);
    router.push('/login');
  };

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    setMenuVisible(false);
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      message.info('个人信息功能开发中');
    } else if (key === 'password') {
      message.info('修改密码功能开发中');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '修改密码',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出',
      danger: true,
    },
  ];

  const triggerArea = (
    <div className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
      <Avatar
        src={userInfo?.avatar_url}
        className="bg-gradient-to-tr from-[#31afff] to-[#1677ff]"
      >
        {userInfo?.nick_name || userInfo?.real_name || userInfo?.login_name?.[0] || '?'}
      </Avatar>
      {!onlyAvatar && (
        <span className="text-sm truncate max-w-[80px]">
          {userInfo?.nick_name || userInfo?.real_name || userInfo?.login_name || ''}
        </span>
      )}
    </div>
  );

  return (
    <div ref={menuRef} className="flex flex-1 items-center justify-center">
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={['click']}
        open={menuVisible}
        onOpenChange={setMenuVisible}
        placement="topLeft"
      >
        {triggerArea}
      </Dropdown>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/new-components/layout/UserBar.tsx
git commit -m "feat(frontend): add dropdown menu to UserBar with profile, password change, and logout options"
```

---

## Task 3: Add Profile Modal and Password Change Modal

**Files:**
- Modify: `web/new-components/layout/UserBar.tsx`
- Create: `web/components/common/UserProfileModal.tsx` (inline in UserBar for simplicity)

- [ ] **Step 1: Add Profile Modal to UserBar**

Update the imports and add modal state and handlers:

```tsx
import { Avatar, Dropdown, MenuProps, message, Modal, Form, Input } from 'antd';
```

Add state and handlers after `userInfo` state:

```tsx
const [profileModalOpen, setProfileModalOpen] = useState(false);
const [passwordModalOpen, setPasswordModalOpen] = useState(false);
const [form] = Form.useForm();
const [passwordForm] = Form.useForm();
```

Update `handleMenuClick`:

```tsx
} else if (key === 'profile') {
  form.setFieldsValue({ real_name: userInfo?.real_name, email: userInfo?.email });
  setProfileModalOpen(true);
} else if (key === 'password') {
  passwordForm.resetFields();
  setPasswordModalOpen(true);
}
```

Add Modal JSX before the closing of the component:

```tsx
<Modal
  title="个人信息"
  open={profileModalOpen}
  onCancel={() => setProfileModalOpen(false)}
  onOk={() => {
    form.validateFields().then(async (values) => {
      try {
        const res = await fetch('/api/v2/sys/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          const updated = { ...userInfo, ...values };
          localStorage.setItem(STORAGE_USERINFO_KEY, JSON.stringify(updated));
          setUserInfo(updated);
          setProfileModalOpen(false);
          message.success('个人信息已更新');
        } else {
          message.error(data.detail || '更新失败');
        }
      } catch {
        message.error('更新失败');
      }
    });
  }}
>
  <Form form={form} layout="vertical">
    <Form.Item label="登录名">
      <Input value={userInfo?.login_name || ''} disabled />
    </Form.Item>
    <Form.Item name="real_name" label="真实姓名">
      <Input />
    </Form.Item>
    <Form.Item name="email" label="邮箱">
      <Input />
    </Form.Item>
  </Form>
</Modal>

<Modal
  title="修改密码"
  open={passwordModalOpen}
  onCancel={() => setPasswordModalOpen(false)}
  onOk={() => {
    passwordForm.validateFields().then(async (values) => {
      if (values.new_password !== values.confirm_password) {
        message.error('两次输入的密码不一致');
        return;
      }
      try {
        const res = await fetch('/api/v2/sys/auth/password', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            old_password: values.old_password,
            new_password: values.new_password,
          }),
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setPasswordModalOpen(false);
          message.success('密码已更新');
          passwordForm.resetFields();
        } else {
          message.error(data.detail || '修改失败');
        }
      } catch {
        message.error('修改失败');
      }
    });
  }}
>
  <Form form={passwordForm} layout="vertical">
    <Form.Item name="old_password" label="原密码" rules={[{ required: true }]}>
      <Input.Password />
    </Form.Item>
    <Form.Item name="new_password" label="新密码" rules={[{ required: true, min: 6 }]}>
      <Input.Password />
    </Form.Item>
    <Form.Item name="confirm_password" label="确认密码" rules={[{ required: true }]}>
      <Input.Password />
    </Form.Item>
  </Form>
</Modal>
```

- [ ] **Step 2: Commit**

```bash
git add web/new-components/layout/UserBar.tsx
git commit -m "feat(frontend): implement profile and password change modals in UserBar"
```

---

## Verification

After all tasks complete, verify by:

1. **Build web:** `cd web && yarn compile`
2. **Rebuild static:** `bash scripts/build_web_static.sh`
3. **Test login flow:** Login → Click avatar → Verify dropdown → Test each menu item

Expected results:
- Dropdown menu appears on avatar click
- Profile modal shows current user info
- Password modal validates and updates password
- Logout clears session and redirects to login