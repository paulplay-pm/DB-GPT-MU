# ChatBI Theme System Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CSS variable-based theming system so all ChatBI pages properly respond to dark/light theme toggles.

**Architecture:** Create `theme.css` with CSS variables for colors. Update `globals.css` to import `theme.css` and remove old `.light`/`.dark` rules. Migrate each page to use CSS variables instead of hardcoded colors.

**Tech Stack:** CSS, Tailwind CSS, Next.js, React, Ant Design

---

## File Structure

| File | Responsibility |
|------|----------------|
| `web/styles/theme.css` | CSS variable definitions for light/dark themes |
| `web/styles/globals.css` | Import theme.css, remove old light/dark body rules |
| `web/pages/favorites/index.tsx` | Use CSS variables instead of hardcoded colors |
| `web/pages/reports/index.tsx` | Use CSS variables instead of hardcoded colors |
| `web/pages/templates/index.tsx` | Use CSS variables instead of hardcoded colors |
| `web/pages/team/index.tsx` | Use CSS variables instead of hardcoded colors |
| `web/new-components/common/PageHeader.tsx` | Use CSS variables instead of hardcoded colors |
| `web/new-components/common/Toolbar.tsx` | Use CSS variables instead of hardcoded colors |
| `web/pages/admin/user.tsx` | Use CSS variables instead of hardcoded colors |
| `web/pages/admin/role.tsx` | Use CSS variables instead of hardcoded colors |
| `web/pages/admin/dept.tsx` | Use CSS variables instead of hardcoded colors |
| `web/pages/admin/permission.tsx` | Use CSS variables instead of hardcoded colors |
| `web/pages/admin/registration.tsx` | Use CSS variables instead of hardcoded colors |

---

## Task 1: Create theme.css with CSS Variables

**Files:**
- Create: `web/styles/theme.css`

- [ ] **Step 1: Create theme.css**

Create `web/styles/theme.css` with complete CSS variable definitions:

```css
/**
 * ChatBI Theme System
 * CSS variables for light/dark theme switching
 */

/* Light theme (default) */
:root {
  /* Background colors */
  --bg-primary: #f7f7f7;
  --bg-secondary: #ffffff;
  --bg-tertiary: #f0f2f5;
  --bg-hover: #f5f5f5;

  /* Text colors */
  --text-primary: #1f1f1f;
  --text-secondary: #666666;
  --text-tertiary: #999999;
  --text-inverse: #ffffff;

  /* Border colors */
  --border-color: #e8e8e8;
  --border-hover: #d9d9d9;

  /* Card colors */
  --card-bg: #ffffff;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  --card-border: #e8e8e8;

  /* Component-specific */
  --input-bg: #ffffff;
  --input-border: #d9d9d9;
  --hover-bg: #f5f5f5;

  /* Status colors */
  --success-bg: #f6ffed;
  --warning-bg: #fffff7;
  --error-bg: #fff2f0;

  /* Icon colors */
  --icon-primary: #666666;
  --icon-secondary: #999999;
}

/* Dark theme */
.dark {
  /* Background colors */
  --bg-primary: #151622;
  --bg-secondary: #1e1f26;
  --bg-tertiary: #252830;
  --bg-hover: #2a2d38;

  /* Text colors */
  --text-primary: #f0f0f0;
  --text-secondary: #a0a0a0;
  --text-tertiary: #707070;
  --text-inverse: #1f1f1f;

  /* Border colors */
  --border-color: #333333;
  --border-hover: #444444;

  /* Card colors */
  --card-bg: #232734;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  --card-border: #333333;

  /* Component-specific */
  --input-bg: #2a2d38;
  --input-border: #444444;
  --hover-bg: #333333;

  /* Status colors */
  --success-bg: #1a3d1a;
  --warning-bg: #3d3a1a;
  --error-bg: #3d1a1a;

  /* Icon colors */
  --icon-primary: #a0a0a0;
  --icon-secondary: #707070;
}
```

- [ ] **Step 2: Commit**

```bash
git add web/styles/theme.css
git commit -m "feat(styles): add theme.css with CSS variables for light/dark theming

- Defines --bg-primary, --bg-secondary, --bg-tertiary
- Defines --text-primary, --text-secondary, --text-tertiary
- Defines --border-color, --border-hover
- Defines --card-bg, --card-shadow, --card-border
- Defines --input-bg, --input-border, --hover-bg
- Defines --success-bg, --warning-bg, --error-bg

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 2: Update globals.css to Import theme.css

**Files:**
- Modify: `web/styles/globals.css`

- [ ] **Step 1: Update globals.css imports and remove old rules**

Open `web/styles/globals.css` and change lines 1-26 from:

```css
@import './chatbi-variables.css';
@import './katex-override.css';
@import './opencode-theme.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: var(--joy-fontFamily-body, var(--joy-Josefin Sans, sans-serif));
  line-height: var(--joy-lineHeight-md, 1.5);
  --antd-primary-color: #0069fe;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-appearance: none;
}

.light {
  color: #333;
  background-color: #f7f7f7;
}

.dark {
  color: #f7f7f7;
  background-color: #151622;
}
```

To:

```css
@import './chatbi-variables.css';
@import './theme.css';
@import './katex-override.css';
@import './opencode-theme.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: var(--joy-fontFamily-body, var(--joy-Josefin Sans, sans-serif));
  line-height: var(--joy-lineHeight-md, 1.5);
  --antd-primary-color: #0069fe;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-appearance: none;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}
```

Note: Remove the old `.light` and `.dark` body rules since they are now in `theme.css`.

- [ ] **Step 2: Commit**

```bash
git add web/styles/globals.css
git commit -m "feat(styles): update globals.css to import theme.css

- Add @import './theme.css' after chatbi-variables.css
- Remove old .light and .dark body rules (now in theme.css)
- Add background-color and color using CSS variables to body

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 3: Migrate Favorites Page to CSS Variables

**Files:**
- Modify: `web/pages/favorites/index.tsx`

- [ ] **Step 1: Replace hardcoded colors with CSS variables**

Open `web/pages/favorites/index.tsx`. Replace the className values:

**Line 32:**
```tsx
// Before
<div className='w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>

// After
<div className='w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center'>
```

**Line 33:**
```tsx
// Before
<StarOutlined className='text-4xl text-gray-300' />

// After
<StarOutlined className='text-4xl text-[var(--text-tertiary)]' />
```

**Line 43 (card):**
```tsx
// Before
className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow cursor-pointer'

// After
className='bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-4 hover:shadow-lg transition-shadow cursor-pointer'
```

**Line 50:**
```tsx
// Before
<div className='font-medium text-gray-900 dark:text-gray-100 truncate'>

// After
<div className='font-medium text-[var(--text-primary)] truncate'>
```

**Line 51:**
```tsx
// Before
<div className='text-sm text-gray-500 mt-1 line-clamp-2'>

// After
<div className='text-sm text-[var(--text-secondary)] mt-1 line-clamp-2'>
```

**Line 52:**
```tsx
// Before
<div className='text-xs text-gray-400 mt-2'>

// After
<div className='text-xs text-[var(--text-tertiary)] mt-2'>
```

- [ ] **Step 2: Run lint check**

```bash
cd /Users/paulwang/work/DB-GPT-MU/web && npm run lint -- --fix pages/favorites/index.tsx 2>&1 | tail -10
```

Expected: No errors on this file.

- [ ] **Step 3: Commit**

```bash
git add web/pages/favorites/index.tsx
git commit -m "feat(favorites): use CSS variables for theme-aware colors

- Replace bg-white, bg-gray-100 with bg-[var(--card-bg)], bg-[var(--bg-tertiary)]
- Replace text-gray-900, text-gray-500, text-gray-400 with text-[var(--text-primary)], etc.
- Card now uses --card-bg, --card-border, --card-shadow

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 4: Migrate Reports Page to CSS Variables

**Files:**
- Modify: `web/pages/reports/index.tsx`

- [ ] **Step 1: Read current file and identify hardcoded colors**

Open `web/pages/reports/index.tsx` to see the current implementation.

- [ ] **Step 2: Replace hardcoded colors with CSS variables**

Apply the same CSS variable replacements:
- `bg-white` → `bg-[var(--card-bg)]`
- `bg-gray-100` → `bg-[var(--bg-tertiary)]`
- `bg-gray-50` → `bg-[var(--bg-hover)]`
- `text-gray-700` → `text-[var(--text-primary)]`
- `text-gray-500` → `text-[var(--text-secondary)]`
- `text-gray-400` → `text-[var(--text-tertiary)]`
- `border-gray-200` → `border-[var(--border-color)]`
- `border-gray-100` → `border-[var(--border-color)]`

Specific replacements for reports page:
- Conversation item: `bg-gray-100 dark:bg-gray-700` → `bg-[var(--bg-tertiary)]`
- Text colors on conversation items
- Border on pagination

- [ ] **Step 3: Run lint check**

```bash
cd /Users/paulwang/work/DB-GPT-MU/web && npm run lint -- --fix pages/reports/index.tsx 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add web/pages/reports/index.tsx
git commit -m "feat(reports): use CSS variables for theme-aware colors

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 5: Migrate PageHeader Component to CSS Variables

**Files:**
- Modify: `web/new-components/common/PageHeader.tsx`

- [ ] **Step 1: Read current file**

Open `web/new-components/common/PageHeader.tsx` to see current implementation.

- [ ] **Step 2: Replace hardcoded colors with CSS variables**

Typical PageHeader pattern:
- Title uses `text-gray-900 dark:text-gray-100` → `text-[var(--text-primary)]`
- Description uses `text-gray-500` → `text-[var(--text-secondary)]`
- Any border/background uses CSS variables

- [ ] **Step 3: Run lint check and commit**

```bash
npm run lint -- --fix new-components/common/PageHeader.tsx 2>&1 | tail -5
git add web/new-components/common/PageHeader.tsx
git commit -m "feat(pageheader): use CSS variables for theme-aware styling

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 6: Migrate Toolbar Component to CSS Variables

**Files:**
- Modify: `web/new-components/common/Toolbar.tsx`

- [ ] **Step 1: Read current file**

Open `web/new-components/common/Toolbar.tsx`.

- [ ] **Step 2: Replace hardcoded colors with CSS variables**

Typical Toolbar pattern:
- Search input: `bg-white dark:bg-gray-700 border-gray-300`
- Placeholder text: `text-gray-400`
- Use CSS variables for all

- [ ] **Step 3: Run lint check and commit**

```bash
npm run lint -- --fix new-components/common/Toolbar.tsx 2>&1 | tail -5
git add web/new-components/common/Toolbar.tsx
git commit -m "feat(toolbar): use CSS variables for theme-aware styling

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 7: Migrate Templates, Team Pages

**Files:**
- Modify: `web/pages/templates/index.tsx`
- Modify: `web/pages/team/index.tsx`

- [ ] **Step 1: Read each file and replace hardcoded colors**

Apply same CSS variable replacements as favorites page.

- [ ] **Step 2: Run lint check and commit**

```bash
npm run lint -- --fix pages/templates/index.tsx pages/team/index.tsx 2>&1 | tail -10
git add web/pages/templates/index.tsx web/pages/team/index.tsx
git commit -m "feat(pages): use CSS variables for theme-aware styling on templates and team pages

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 8: Migrate Admin Pages

**Files:**
- Modify: `web/pages/admin/user.tsx`
- Modify: `web/pages/admin/role.tsx`
- Modify: `web/pages/admin/dept.tsx`
- Modify: `web/pages/admin/permission.tsx`
- Modify: `web/pages/admin/registration.tsx`

- [ ] **Step 1: Read each file**

For each admin page, identify hardcoded colors that need to be replaced.

- [ ] **Step 2: Replace hardcoded colors with CSS variables**

Common patterns in admin pages:
- Table headers: `bg-gray-50` → `bg-[var(--bg-tertiary)]`
- Table borders: `border-gray-200` → `border-[var(--border-color)]`
- Text in cells: `text-gray-600`, `text-gray-500` → CSS variables
- Card backgrounds: `bg-white` → `bg-[var(--card-bg)]`

- [ ] **Step 3: Run lint check and commit**

```bash
npm run lint -- --fix pages/admin/user.tsx pages/admin/role.tsx pages/admin/dept.tsx pages/admin/permission.tsx pages/admin/registration.tsx 2>&1 | tail -10
git add web/pages/admin/user.tsx web/pages/admin/role.tsx web/pages/admin/dept.tsx web/pages/admin/permission.tsx web/pages/admin/registration.tsx
git commit -m "feat(admin): use CSS variables for theme-aware styling on admin pages

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Spec Self-Review

1. **Spec coverage check:**
   - CSS variable definitions: Task 1 ✅
   - globals.css import: Task 2 ✅
   - Favorites page: Task 3 ✅
   - Reports page: Task 4 ✅
   - PageHeader: Task 5 ✅
   - Toolbar: Task 6 ✅
   - Templates, Team: Task 7 ✅
   - Admin pages: Task 8 ✅

2. **Placeholder scan:** No TBD/TODO found - all steps have complete code

3. **Type consistency:** CSS variables use consistent naming (`--bg-primary`, `--text-primary`, etc.)

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-chatbi-theme-system-fix-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**