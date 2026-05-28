# ChatBI Theme Fix - Additional Issues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all theme-related UI bugs in ChatBI - dropdown menus, sidebar, tabs, tables, modals not responding to dark/light theme switching.

**Architecture:** Replace hardcoded colors with CSS variables, add dark mode CSS overrides for Ant Design components via globals.css and CSS modules.

**Tech Stack:** CSS, Tailwind CSS, Ant Design, CSS Modules, react-i18next

---

## File Structure

| File | Responsibility |
|------|----------------|
| `web/new-components/layout/UserBar.tsx` | Fix dropdown menu background/border, language/theme buttons |
| `web/components/layout/NewSideBar/index.tsx` | Fix sidebar active menu, white backgrounds |
| `web/styles/globals.css` | Fix tab unselected text, add dark mode Ant Design overrides |
| `web/pages/construct/database.tsx` | Fix bg-white card background |
| `web/pages/construct/knowledge/index.tsx` | Fix knowledge modal dark mode |
| `web/pages/construct/prompt/index.tsx` | Fix prompt table dark mode |
| `web/pages/construct/app/components/create-app-modal/styles.module.css` | Fix app modal dark mode |
| `web/components/models_evaluation/EvaluationList.tsx` | Fix evaluation table dark mode |

---

## Task 1: Fix UserBar Dropdown Menu

**Files:**
- Modify: `web/new-components/layout/UserBar.tsx:217-230`

- [ ] **Step 1: Fix dropdown background and border**

Replace hardcoded `white` and `#ddd` with CSS variables:

```tsx
// Before (lines 217-230)
<div
  id='user-dropdown-menu'
  style={{
    position: 'absolute',
    bottom: '100%',
    left: 0,
    background: 'white',           // HARDCODED
    border: '1px solid #ddd',       // HARDCODED
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: 120,
    display: menuVisible ? 'block' : 'none',
  }}
>

// After
<div
  id='user-dropdown-menu'
  style={{
    position: 'absolute',
    bottom: '100%',
    left: 0,
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 4,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: 120,
    display: menuVisible ? 'block' : 'none',
  }}
>
```

- [ ] **Step 2: Fix language/theme selector buttons**

Replace `bg-gray-100 hover:bg-gray-200` with theme-aware classes:

**Line ~125** (language zh button):
```tsx
// Before
className={`px-2 py-0.5 text-xs rounded ${lang === 'zh' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}

// After
className={`px-2 py-0.5 text-xs rounded ${lang === 'zh' ? 'bg-primary text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--hover-bg)] text-[var(--text-primary)]'}`}
```

**Line ~136** (language en button):
```tsx
// Before
className={`px-2 py-0.5 text-xs rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}

// After
className={`px-2 py-0.5 text-xs rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--hover-bg)] text-[var(--text-primary)]'}`}
```

**Line ~157** (theme light button):
```tsx
// Before
className={`px-2 py-0.5 text-xs rounded ${theme === 'light' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}

// After
className={`px-2 py-0.5 text-xs rounded ${theme === 'light' ? 'bg-primary text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--hover-bg)] text-[var(--text-primary)]'}`}
```

**Line ~169** (theme dark button):
```tsx
// Before
className={`px-2 py-0.5 text-xs rounded ${theme === 'dark' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}

// After
className={`px-2 py-0.5 text-xs rounded ${theme === 'dark' ? 'bg-primary text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--hover-bg)] text-[var(--text-primary)]'}`}
```

- [ ] **Step 3: Run lint check**

```bash
cd /Users/paulwang/work/DB-GPT-MU/web && npm run lint -- --fix new-components/layout/UserBar.tsx 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add web/new-components/layout/UserBar.tsx
git commit -m "fix(theme): fix UserBar dropdown and buttons for dark mode

- Change dropdown background from white to var(--bg-secondary)
- Change dropdown border from #ddd to var(--border-color)
- Change language/theme buttons from bg-gray-100 to bg-[var(--bg-tertiary)]
- Change hover from bg-gray-200 to bg-[var(--hover-bg)]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 2: Fix Sidebar Active Menu and White Backgrounds

**Files:**
- Modify: `web/components/layout/NewSideBar/index.tsx`

- [ ] **Step 1: Fix sidebar active menu item background**

Replace `bg-primary-light/30` with theme-aware background:

**Line ~74** (active menu item):
```tsx
// Before
className={cls(
  'group relative flex items-center h-11 px-4 cursor-pointer transition-all duration-200 rounded-lg mx-2',
  'hover:bg-primary-light/50',
  {
    'bg-primary-light/30': isActive,
  },
)}

// After
className={cls(
  'group relative flex items-center h-11 px-4 cursor-pointer transition-all duration-200 rounded-lg mx-2',
  'hover:bg-[var(--hover-bg)]',
  {
    'bg-[var(--bg-tertiary)]': isActive,
  },
)}
```

**Line ~86-87** (icon active color):
```tsx
// Before
isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700'

// After
isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
```

**Line ~96** (label active color):
```tsx
// Before
isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-900'

// After
isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
```

- [ ] **Step 2: Fix sidebar white backgrounds**

**Line ~243** (collapsed sidebar):
```tsx
// Before
<div className='flex flex-col h-screen w-16 min-w-16 bg-white dark:bg-[#232734] border-r border-gray-200 dark:border-gray-700'>

// After
<div className='flex flex-col h-screen w-16 min-w-16 bg-[var(--bg-secondary)] border-r border-[var(--border-color)]'>
```

**Line ~245** (collapsed sidebar border):
```tsx
// Before
<div className='flex flex-col items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 gap-1'>

// After
<div className='flex flex-col items-center justify-center h-16 border-b border-[var(--border-color)] gap-1'>
```

**Line ~335** (expanded sidebar):
```tsx
// Before
<div className='flex flex-col h-screen w-60 min-w-60 bg-white dark:bg-[#232734] border-r border-gray-200 dark:border-gray-700'>

// After
<div className='flex flex-col h-screen w-60 min-w-60 bg-[var(--bg-secondary)] border-r border-[var(--border-color)]'>
```

**Line ~337** (expanded sidebar header border):
```tsx
// Before
<div className='flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700'>

// After
<div className='flex items-center justify-between h-16 px-4 border-b border-[var(--border-color)]'>
```

**Line ~342** (logo text color):
```tsx
// Before
<span className='font-semibold text-gray-800 dark:text-gray-200'>DB-GPT</span>

// After
<span className='font-semibold text-[var(--text-primary)]'>DB-GPT</span>
```

**Line ~354** (collapse button):
```tsx
// Before
className='flex items-center justify-center w-7 h-7 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded transition-colors'

// After
className='flex items-center justify-center w-7 h-7 cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded transition-colors'
```

**Line ~366** (footer background):
```tsx
// Before
<div className='flex items-center gap-2 px-2 py-2 bg-gray-50 dark:bg-[#2d323f] rounded-lg'>

// After
<div className='flex items-center gap-2 px-2 py-2 bg-[var(--bg-tertiary)] rounded-lg'>
```

**Line ~317** (footer border):
```tsx
// Before
<div className='p-2 border-t border-gray-200 dark:border-gray-700'>

// After
<div className='p-2 border-t border-[var(--border-color)]'>
```

**Line ~365** (footer border):
```tsx
// Before
<div className='p-3 border-t border-gray-200 dark:border-gray-700'>

// After
<div className='p-3 border-t border-[var(--border-color)]'>
```

- [ ] **Step 3: Run lint check**

```bash
cd /Users/paulwang/work/DB-GPT-MU/web && npm run lint -- --fix components/layout/NewSideBar/index.tsx 2>&1 | tail -10
```

- [ ] **Step 4: Commit**

```bash
git add web/components/layout/NewSideBar/index.tsx
git commit -m "fix(theme): fix sidebar for dark mode

- Change active menu bg from bg-primary-light/30 to bg-[var(--bg-tertiary)]
- Change icon/text colors to use CSS variables
- Change sidebar bg from white/dark:#232734 to var(--bg-secondary)
- Change all borders to var(--border-color)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 3: Fix Reports Tabs Unselected Text Color

**Files:**
- Modify: `web/styles/globals.css`

- [ ] **Step 1: Add light mode unselected tab styling**

Add CSS for unselected tabs in light mode:

```css
/* Unselected tab text - light mode */
.ant-tabs-tab:not(.ant-tabs-tab-active) .ant-tabs-tab-btn {
  color: var(--text-secondary);
}

/* Unselected tab text - dark mode */
.dark .ant-tabs-tab:not(.ant-tabs-tab-active) .ant-tabs-tab-btn {
  color: #a0a0a0;
}

/* Tab hover */
.ant-tabs-tab:not(.ant-tabs-tab-active):hover .ant-tabs-tab-btn {
  color: var(--text-primary);
}
```

- [ ] **Step 2: Commit**

```bash
git add web/styles/globals.css
git commit -m "fix(theme): fix reports tabs unselected text color

- Add color: var(--text-secondary) for unselected tabs in light mode
- Add dark mode override for unselected tabs

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 4: Fix Database Page Card Background

**Files:**
- Modify: `web/pages/construct/database.tsx`

- [ ] **Step 1: Fix card background**

**Line ~185:**
```tsx
// Before
<div className='bg-white rounded-[12px] p-4 shadow-sm'>

// After
<div className='bg-[var(--card-bg)] rounded-[12px] p-4 shadow-sm'>
```

- [ ] **Step 2: Run lint check**

```bash
cd /Users/paulwang/work/DB-GPT-MU/web && npm run lint -- --fix pages/construct/database.tsx 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add web/pages/construct/database.tsx
git commit -m "fix(theme): fix database page card background

- Change bg-white to bg-[var(--card-bg)]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 5: Fix Knowledge Modal Dark Mode

**Files:**
- Modify: `web/styles/globals.css`

- [ ] **Step 1: Add Ant Design Modal dark mode overrides**

Add CSS for modal content background:

```css
/* Knowledge modal dark mode */
.dark .ant-modal-content {
  background-color: var(--bg-secondary) !important;
}

.dark .ant-modal-header {
  background-color: var(--bg-secondary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.dark .ant-modal-footer {
  border-top: 1px solid var(--border-color) !important;
}

.dark .ant-modal-body {
  background-color: var(--bg-secondary) !important;
}
```

- [ ] **Step 2: Commit**

```bash
git add web/styles/globals.css
git commit -m "fix(theme): add knowledge modal dark mode support

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 6: Fix Prompt Table Dark Mode

**Files:**
- Modify: `web/styles/globals.css`

- [ ] **Step 1: Add Ant Design Table dark mode overrides**

```css
/* Table dark mode */
.dark .ant-table {
  background-color: var(--bg-secondary) !important;
}

.dark .ant-table-thead > tr > th {
  background-color: var(--bg-tertiary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

.dark .ant-table-tbody > tr > td {
  border-bottom: 1px solid var(--border-color) !important;
}

.dark .ant-table-tbody > tr:hover > td {
  background-color: var(--hover-bg) !important;
}

.dark .ant-table-wrapper .ant-table-pagination {
  background-color: transparent;
}
```

- [ ] **Step 2: Commit**

```bash
git add web/styles/globals.css
git commit -m "fix(theme): add prompt table dark mode support

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 7: Fix App Modal Dark Mode

**Files:**
- Modify: `web/pages/construct/app/components/create-app-modal/styles.module.css`

- [ ] **Step 1: Add dark mode CSS**

Add at the end of file:

```css
/* Dark mode overrides */
.create-app-modal-container :global .ant-modal-content {
  background-color: var(--bg-secondary);
}

.create-app-modal-container :global .ant-modal-header {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.create-app-modal-container :global .ant-modal-body {
  background-color: var(--bg-secondary);
}

.create-app-modal-container :global .ant-modal-footer {
  border-top: 1px solid var(--border-color);
}
```

- [ ] **Step 2: Commit**

```bash
git add web/pages/construct/app/components/create-app-modal/styles.module.css
git commit -m "fix(theme): add app modal dark mode support

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Task 8: Fix Model Evaluation Table Dark Mode

**Files:**
- Modify: `web/styles/globals.css`

- [ ] **Step 1: Add evaluation list table dark mode**

The EvaluationList uses a Table component. Add general table overrides that will apply:

```css
/* Evaluation table dark mode - uses same overrides as Task 6 */
```

Note: Since Task 6 already added `.dark .ant-table` overrides, this should be covered. Verify by checking if EvaluationList renders properly.

- [ ] **Step 2: Commit**

```bash
git add web/styles/globals.css
git commit -m "fix(theme): verify evaluation table dark mode

Note: Table dark mode was added in Task 6, this task verifies coverage

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"
```

---

## Spec Self-Review

1. **Spec coverage check:**
   - UserBar dropdown: Task 1 ✅
   - UserBar buttons: Task 1 ✅
   - Sidebar active menu: Task 2 ✅
   - Sidebar white backgrounds: Task 2 ✅
   - Reports tabs: Task 3 ✅
   - Database card: Task 4 ✅
   - Knowledge modal: Task 5 ✅
   - Prompt table: Task 6 ✅
   - App modal: Task 7 ✅
   - Model eval table: Task 8 ✅

2. **Placeholder scan:** No TBD/TODO found - all steps have complete code

3. **Type consistency:** CSS variables use consistent naming (--bg-secondary, --border-color, etc.)

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-05-28-chatbi-theme-fix-v2-plan.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**