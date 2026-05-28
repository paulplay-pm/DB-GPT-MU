# ChatBI i18n Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix i18n issues in ChatBI admin pages by wrapping hardcoded Chinese strings with t('key') and fixing CSS variable syntax errors.

**Architecture:** Admin pages already use useTranslation hook correctly. The issue is hardcoded Chinese strings in useState initializers and CSS variable syntax errors. Fix each file, add missing keys to locale files.

**Tech Stack:** CSS, Tailwind CSS, Next.js, React, Ant Design, react-i18next

---

## File Structure

| File | Responsibility |
|------|----------------|
| `web/pages/admin/user.tsx` | Fix hardcoded '新增用户' string |
| `web/pages/admin/registration.tsx` | Fix CSS variable syntax `text-[--text-secondary]` → `text-[var(--text-secondary)]` |
| `web/locales/en/common.ts` | Add missing English translation keys |
| `web/locales/zh/common.ts` | Add missing Chinese translation keys |

---

## Task 1: Fix user.tsx Hardcoded String

**Files:**
- Modify: `web/pages/admin/user.tsx:31`

- [ ] **Step 1: Fix hardcoded Chinese string**

Open `web/pages/admin/user.tsx` line 31:

```tsx
// Before
const [modalTitle, setModalTitle] = useState('新增用户');

// After
const [modalTitle, setModalTitle] = useState(t('Add_User'));
```

Note: The key `Add_User` already exists in common.ts locale files (used in role.tsx and dept.tsx). No new key needed.

- [ ] **Step 2: Run lint check**

```bash
cd /Users/paulwang/work/DB-GPT-MU/web && npm run lint -- --fix pages/admin/user.tsx 2>&1 | tail -10
```

Expected: No errors on this file.

- [ ] **Step 3: Commit**

```bash
git add web/pages/admin/user.tsx
git commit -m "fix(admin): use t('Add_User') instead of hardcoded Chinese

- Replace '新增用户' with t('Add_User') in user modal title

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 2: Fix registration.tsx CSS Variable Syntax

**Files:**
- Modify: `web/pages/admin/registration.tsx:236`

- [ ] **Step 1: Fix CSS variable syntax**

Open `web/pages/admin/registration.tsx` line 236:

```tsx
// Before
<span className='text-[--text-secondary]'>{t('Registration_Status_Filter')}：</span>

// After
<span className='text-[var(--text-secondary)]'>{t('Registration_Status_Filter')}：</span>
```

Note: The `--text-secondary` CSS variable is defined in theme.css. The issue is the syntax `text-[--text-secondary]` is invalid - it should be `text-[var(--text-secondary)]`.

- [ ] **Step 2: Run lint check**

```bash
cd /Users/paulwang/work/DB-GPT-MU/web && npm run lint -- --fix pages/admin/registration.tsx 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add web/pages/admin/registration.tsx
git commit -m "fix(admin): fix CSS variable syntax in registration page

- Change text-[--text-secondary] to text-[var(--text-secondary)]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 3: Verify All Admin Pages are i18n Clean

**Files:**
- Read: `web/pages/admin/user.tsx`
- Read: `web/pages/admin/role.tsx`
- Read: `web/pages/admin/dept.tsx`
- Read: `web/pages/admin/permission.tsx`
- Read: `web/pages/admin/registration.tsx`

- [ ] **Step 1: Scan for hardcoded Chinese strings**

Search each file for any remaining hardcoded Chinese strings (strings with Chinese characters that are not wrapped in t()).

```bash
cd /Users/paulwang/work/DB-GPT-MU/web && grep -n '[\u4e00-\u9fff]' pages/admin/user.tsx pages/admin/role.tsx pages/admin/dept.tsx pages/admin/permission.tsx pages/admin/registration.tsx 2>/dev/null || echo "No hardcoded Chinese found"
```

Note: If any hardcoded Chinese strings are found, wrap them with t('key') and add the key to locale files.

- [ ] **Step 2: Verify CSS variable syntax**

Check for any incorrect CSS variable syntax patterns like `text-[--xxx]` instead of `text-[var(--xxx)]`.

```bash
cd /Users/paulwang/work/DB-GPT-MU/web && grep -En '\[--[a-zA-Z]' pages/admin/*.tsx
```

- [ ] **Step 3: Commit verification result**

```bash
git add docs/superpowers/plans/2026-05-28-chatbi-i18n-fix-plan.md
git commit -m "chore: verify admin pages i18n compliance

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Spec Self-Review

1. **Spec coverage check:**
   - user.tsx hardcoded string: Task 1 ✅
   - registration.tsx CSS variable syntax: Task 2 ✅
   - Full admin pages verification: Task 3 ✅

2. **Placeholder scan:** No TBD/TODO found - all steps have complete code

3. **Type consistency:** Uses existing t() pattern and existing translation keys from common.ts

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-chatbi-i18n-fix-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**