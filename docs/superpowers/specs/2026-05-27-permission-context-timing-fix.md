# Permission Context 权限加载时序问题修复

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复用户登录后权限菜单不显示问题 - 登录后立即显示正确的权限，不需要刷新页面

**Architecture:** PermissionContext 使用 useEffect 异步读取 localStorage，导致首次渲染时 permissions 状态为空。通过移除 useEffect，直接在 render 同步读取 localStorage 解决此问题。

**Tech Stack:** React, Next.js, TypeScript

---

## 问题描述

用户登录后，`PermissionProvider` 通过 `useEffect` 异步从 localStorage 读取权限：

```tsx
useEffect(() => {
  const userInfo = localStorage.getItem(STORAGE_USERINFO_KEY);
  if (userInfo) {
    const user = JSON.parse(userInfo);
    setPermissions(user.permissions || []);
  }
}, []);
```

这导致：
1. 用户登录 → localStorage 写入用户信息（含 permissions）
2. `router.push('/')` 立即导航到首页
3. SideBar 渲染时 `useEffect` 尚未执行，permissions 为空
4. 菜单不显示任何权限

## 修改方案

### 修改文件
- `web/context/PermissionContext.tsx`

### 修改内容

1. 移除 `useEffect` 对 localStorage 的异步读取
2. 在组件初始化时同步读取 localStorage 并设置 state
3. 保持 `hasPermission` 函数逻辑不变

### 修改前
```tsx
export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const userInfo = localStorage.getItem(STORAGE_USERINFO_KEY);
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setPermissions(user.permissions || []);
    }
  }, []);

  const hasPermission = (code: string) => {
    const userInfo = JSON.parse(localStorage.getItem(STORAGE_USERINFO_KEY) || '{}');
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

### 修改后
```tsx
export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>(() => {
    // 同步读取 localStorage 初始化 state
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem(STORAGE_USERINFO_KEY);
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          return user.permissions || [];
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = () => {
      const userInfo = localStorage.getItem(STORAGE_USERINFO_KEY);
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          setPermissions(user.permissions || []);
        } catch {
          setPermissions([]);
        }
      } else {
        setPermissions([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const hasPermission = (code: string) => {
    const userInfo = JSON.parse(localStorage.getItem(STORAGE_USERINFO_KEY) || '{}');
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

## 验证步骤

1. 用 kk 用户登录，确认不需要刷新即可看到正确的 10 个权限菜单
2. 退出登录，用其他用户登录，确认权限显示正确
3. 超级管理员登录，确认看到所有菜单