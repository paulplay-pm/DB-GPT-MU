# TopActionBar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed top action bar (h-16 = 64px) above all page content with breadcrumb navigation, help/notification/new-chat buttons.

**Architecture:** Create TopActionBar component in `web/new-components/layout/TopActionBar/`, integrate into `_app.tsx` layout, remove FloatHelper, update page navigation to pass parent param.

**Tech Stack:** React, TypeScript, Tailwind CSS, Ant Design, Next.js Pages Router

---

## Task 1: Create TopActionBar Component

**Files:**
- Create: `web/new-components/layout/TopActionBar/index.tsx`
- Create: `web/new-components/layout/TopActionBar/TopActionBar.module.css` (if needed)

- [ ] **Step 1: Create TopActionBar component directory and file**

Create `web/new-components/layout/TopActionBar/index.tsx` with:

```tsx
import { QuestionCircleOutlined, BellOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

// Page name mapping: path -> i18n key
const PAGE_NAME_MAP: { [key: string]: string } = {
  '/': 'chat',
  '/reports': 'reports',
  '/favorites': 'favorites',
  '/templates': 'templates',
  '/team': 'team',
  '/construct/database': 'datasources',
  '/construct/knowledge': 'knowledge',
  '/construct/skills': 'skills',
  '/construct/prompt': 'prompts',
  '/construct/flow': 'awel_workflow',
  '/construct/app': 'app_management',
  '/construct/models': 'model_management',
  '/models_evaluation': 'models_evaluation',
  '/construct/dbgpts': 'dbgpts_community',
  '/admin/registration': 'registration_review',
  '/admin/user': 'user_management',
  '/admin/role': 'role_management',
  '/admin/dept': 'dept_management',
  '/admin/permission': 'permission_management',
};

// Parent path mapping: parent key -> path
const PAGE_PATH_MAP: { [key: string]: string } = {
  chat: '/',
  reports: '/reports',
  favorites: '/favorites',
  templates: '/templates',
  team: '/team',
  datasources: '/construct/database',
  knowledge: '/construct/knowledge',
  skills: '/construct/skills',
  prompts: '/construct/prompt',
  awel_workflow: '/construct/flow',
  app_management: '/construct/app',
  model_management: '/construct/models',
  models_evaluation: '/models_evaluation',
  dbgpts_community: '/construct/dbgpts',
  registration_review: '/admin/registration',
  user_management: '/admin/user',
  role_management: '/admin/role',
  dept_management: '/admin/dept',
  permission_management: '/admin/permission',
};

function TopActionBar() {
  const { t } = useTranslation();
  const router = useRouter();

  const breadcrumbs = useMemo(() => {
    const { pathname, query } = router;
    const parentKey = PAGE_NAME_MAP[pathname];

    // If no parent mapping, try to find by checking if pathname starts with a key
    let resolvedParentKey = parentKey;
    if (!resolvedParentKey) {
      // Check for partial matches like /construct/flow vs /construct/flow/canvas
      const keys = Object.keys(PAGE_NAME_MAP);
      resolvedParentKey = keys.find(
        k => k !== '/' && pathname.startsWith(k)
      ) || 'chat';
    }

    const parent = resolvedParentKey || 'chat';
    const parentPath = PAGE_PATH_MAP[parent] || '/';

    // Get child from query if present
    const child = typeof query.id === 'string' ? query.id : undefined;

    return { parent, parentPath, child };
  }, [router.pathname, router.query]);

  const handleHelp = () => {
    window.open('http://docs.dbgpt.cn', '_blank');
  };

  const handleNotification = () => {
    Modal.info({
      title: t('no_notification') || '暂无通知',
      content: null,
      okText: t('close') || '关闭',
    });
  };

  const handleNewChat = () => {
    router.push('/');
  };

  const handleParentClick = () => {
    router.push(breadcrumbs.parentPath);
  };

  return (
    <div className='h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]'>
      {/* Left: Breadcrumb */}
      <div className='flex items-center gap-2'>
        {breadcrumbs.child ? (
          <>
            <span
              className='text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors'
              onClick={handleParentClick}
            >
              {t(breadcrumbs.parent)}
            </span>
            <span className='text-[var(--text-tertiary)]'>/</span>
            <span className='text-[var(--text-primary)] font-medium'>
              {breadcrumbs.child.length > 20
                ? breadcrumbs.child.substring(0, 20) + '...'
                : breadcrumbs.child}
            </span>
          </>
        ) : (
          <span className='text-[var(--text-primary)] font-medium'>
            {t(breadcrumbs.parent)}
          </span>
        )}
      </div>

      {/* Right: Action buttons */}
      <div className='flex items-center gap-4'>
        <Tooltip title={t('help') || '帮助'}>
          <QuestionCircleOutlined
            className='text-lg cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
            onClick={handleHelp}
          />
        </Tooltip>

        <Tooltip title={t('notification') || '通知'}>
          <BellOutlined
            className='text-lg cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
            onClick={handleNotification}
          />
        </Tooltip>

        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={handleNewChat}
          size='middle'
        >
          {t('new_chat') || '新建对话'}
        </Button>
      </div>
    </div>
  );
}

export default TopActionBar;
```

- [ ] **Step 2: Add i18n translations**

Add to `web/app/i18n/locales/zh/translation.json`:
```json
{
  "chat": "对话",
  "reports": "我的报告",
  "help": "帮助",
  "notification": "通知",
  "new_chat": "新建对话",
  "no_notification": "暂无通知",
  "close": "关闭"
}
```

Add to `web/app/i18n/locales/en/translation.json`:
```json
{
  "chat": "Chat",
  "reports": "Reports",
  "help": "Help",
  "notification": "Notification",
  "new_chat": "New Chat",
  "no_notification": "No notifications",
  "close": "Close"
}
```

- [ ] **Step 3: Commit**

```bash
git add web/new-components/layout/TopActionBar/
git add web/app/i18n/locales/zh/translation.json
git add web/app/i18n/locales/en/translation.json
git commit -m "feat: create TopActionBar component"
```

---

## Task 2: Integrate TopActionBar into Layout

**Files:**
- Modify: `web/pages/_app.tsx`

- [ ] **Step 1: Import TopActionBar and remove FloatHelper**

In `_app.tsx`, update the imports:
```tsx
// Change from:
import FloatHelper from '@/new-components/layout/FloatHelper';

// To:
// Remove FloatHelper import entirely
```

Add TopActionBar import:
```tsx
import TopActionBar from '@/new-components/layout/TopActionBar';
```

- [ ] **Step 2: Remove FloatHelper from renderContent**

In `renderContent()` function, remove `<FloatHelper />` from the JSX.

Current code (lines 123-125):
```tsx
<div className='flex flex-col flex-1 relative overflow-hidden'>{children}</div>
<FloatHelper />
```

Change to:
```tsx
<div className='flex flex-col flex-1 relative overflow-hidden'>
  <TopActionBar />
  {children}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add web/pages/_app.tsx
git commit -m "feat: integrate TopActionBar and remove FloatHelper"
```

---

## Task 3: Update Page Navigation for Parent Param

**Files:**
- Modify: `web/pages/reports/index.tsx`
- Modify: `web/pages/conversations/index.tsx`

- [ ] **Step 1: Update reports page session list click**

In `pages/reports/index.tsx`, find the div with `onClick={() => router.push(`/?id=${conv.conv_uid}`)}` (line ~150).

Change from:
```tsx
onClick={() => router.push(`/?id=${conv.conv_uid}`)}
```

To:
```tsx
onClick={() => router.push(`/?id=${conv.conv_uid}&parent=reports`)}
```

- [ ] **Step 2: Check if conversations page needs same update**

Read `pages/conversations/index.tsx` to find similar navigation patterns. If exists, update similarly.

- [ ] **Step 3: Commit**

```bash
git add web/pages/reports/index.tsx
git add web/pages/conversations/index.tsx
git commit -m "feat: pass parent param when navigating to chat from sub-pages"
```

---

## Task 4: Build Verification

- [ ] **Step 1: Run build**

```bash
cd web && npm run build 2>&1 | tail -20
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: implement TopActionBar for all pages"
```

---

## Task 5: Delete FloatHelper Component

**Files:**
- Delete: `web/new-components/layout/FloatHelper.tsx`

- [ ] **Step 1: Delete FloatHelper**

Remove the FloatHelper component file since it's no longer used.

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "refactor: remove FloatHelper (functionality moved to TopActionBar)"
```

---

## Task Dependencies

```
Task 1 (TopActionBar Component)
    ↓
Task 2 (Integrate into Layout) ────────────────────┐
    ↓                                             ↓
Task 3 (Update Page Navigation)                    │
    ↓                                             ↓
Task 4 (Build Verification) ──────────────────────┤
    ↓                                             ↓
Task 5 (Delete FloatHelper) ──────────────────────┘
```

---

## Verification Checklist

After implementation, verify:
- [ ] TopActionBar appears at top of content area (h-16 = 64px)
- [ ] Breadcrumb shows page name in current language
- [ ] When navigating from reports to a session, breadcrumb shows "我的报告 / 会话标题"
- [ ] Click on parent breadcrumb navigates back to parent page
- [ ] Help icon opens docs.dbgpt.cn in new tab
- [ ] Notification icon shows "暂无通知" modal
- [ ] New Chat button navigates to home page
- [ ] FloatHelper no longer appears in bottom-right
- [ ] Chat page (/) still shows its ChatHeader (not affected)
- [ ] Build succeeds
