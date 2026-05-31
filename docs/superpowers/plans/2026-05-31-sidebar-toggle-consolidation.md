# Sidebar Toggle Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate sidebar collapse/expand into TopActionBar. Remove duplicate toggle from sidebar. Show logo in sidebar top when collapsed.

**Architecture:** Single toggle in TopActionBar (hamburger always visible). Sidebar shows logo when collapsed, brand name when expanded.

**Tech Stack:** Next.js, React, Ant Design, TypeScript, Tailwind CSS

---

## File Structure

| File | Responsibility |
|------|-----------------|
| `web/new-components/layout/TopActionBar/index.tsx` | Hamburger always left; no logo; breadcrumb after hamburger |
| `web/components/layout/NewSideBar/index.tsx` | Expanded: logo+name only; Collapsed: logo area at top |

---

## Tasks

### Task 1: Update TopActionBar — Hamburger always visible, no logo

**File:** `web/new-components/layout/TopActionBar/index.tsx`

- [ ] **Step 1: Remove `useBrand` import** (no longer needed in TopActionBar)

```typescript
// REMOVE this line:
import { useBrand } from '@/context/BrandContext';
```

- [ ] **Step 2: Remove `brandConfig` from context destructuring**

```typescript
// REMOVE from:
const { brandConfig } = useBrand();
```

- [ ] **Step 3: Replace left section — always show hamburger with dynamic tooltip**

```typescript
// REPLACE the entire {/* Left: Toggle button or Logo */} section (lines 126-143) with:
<div className='flex items-center gap-2'>
  <Tooltip title={t(isMenuExpand ? 'collapse_sidebar' : 'expand_sidebar')} placement='bottom'>
    <MenuOutlined
      className='text-lg cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
      onClick={handleToggleSidebar}
    />
  </Tooltip>
</div>
```

- [ ] **Step 4: Verify current code** — confirm `handleToggleSidebar` is already defined at line ~119 (it is)

- [ ] **Step 5: Commit**

```bash
cd /Users/paulwang/work/DB-GPT-MU/web
git add new-components/layout/TopActionBar/index.tsx
git commit -m "feat(layout): always show hamburger in TopActionBar, remove logo logic"
```

---

### Task 2: Update NewSideBar expanded header — remove collapse button

**File:** `web/components/layout/NewSideBar/index.tsx` (expanded header section, lines ~356-381)

- [ ] **Step 1: Remove the collapse button from expanded header**

```typescript
// REPLACE the header div content (lines 356-381):
<div className='h-16 flex items-center px-6 border-b border-[var(--border-color)] border-b-[1px] bg-[var(--bg-secondary)] box-border overflow-hidden shrink-0'>
  <div className='flex items-center gap-3'>
    {brandConfig.logo_url ? (
      <img src={brandConfig.logo_url} className='w-8 h-8 rounded-lg object-cover' />
    ) : (
      <div className='w-8 h-8 bg-gradient-to-br from-[#31afff] to-[#1677ff] rounded-lg flex items-center justify-center'>
        <span className='text-white font-bold text-sm'>
          {i18next.language === 'en'
            ? brandConfig.product_name_en.slice(0, 1)
            : brandConfig.product_name_zh.slice(0, 1)}
        </span>
      </div>
    )}
    <span className='font-semibold text-[var(--text-primary)]'>
      {i18next.language === 'en' ? brandConfig.product_name_en : brandConfig.product_name_zh}
    </span>
  </div>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add components/layout/NewSideBar/index.tsx
git commit -m "feat(layout): remove collapse button from expanded sidebar header"
```

---

### Task 3: Update NewSideBar collapsed state — replace expand button with logo area

**File:** `web/components/layout/NewSideBar/index.tsx` (collapsed state, lines ~270-351)

- [ ] **Step 1: Replace the expand button area with logo area**

```typescript
// REPLACE the {/* Expand button area */} section (lines 274-283):
{/* Logo area when collapsed */}
<div className='flex items-center justify-center h-16 border-b border-[var(--border-color)] border-b-[1px] bg-[var(--bg-secondary)] box-border'>
  {brandConfig.logo_url ? (
    <img src={brandConfig.logo_url} alt='logo' className='h-10 w-auto object-contain' />
  ) : (
    <div className='w-10 h-10 bg-gradient-to-br from-[#31afff] to-[#1677ff] rounded-lg flex items-center justify-center'>
      <span className='text-white font-bold text-base'>
        {i18next.language === 'en'
          ? brandConfig.product_name_en.slice(0, 1)
          : brandConfig.product_name_zh.slice(0, 1)}
      </span>
    </div>
  )}
</div>
```

- [ ] **Step 2: Verify nav items area unchanged** — the `{/* Nav items */}` section after the logo area should remain as-is

- [ ] **Step 3: Commit**

```bash
git add components/layout/NewSideBar/index.tsx
git commit -m "feat(layout): show logo in sidebar top when collapsed, replace expand button"
```

---

## Verification

After all tasks:
1. Run `yarn compile` in `web/` — should succeed with no new errors
2. Rebuild static: `bash ../scripts/build_web_static.sh`
3. Restart server: `uv run dbgpt start webserver`
4. Test:
   - Sidebar expanded: hamburger in TopActionBar toggles sidebar; sidebar header has logo+name, no collapse button
   - Sidebar collapsed: TopActionBar hamburger toggles sidebar; sidebar top shows logo (or gradient avatar); nav icons below unchanged

---

## Spec Coverage Check

- TopActionBar hamburger always visible: Task 1 ✓
- TopActionBar no logo display: Task 1 ✓
- TopActionBar tooltip changes with state: Task 1 ✓
- Sidebar expanded header — remove collapse button: Task 2 ✓
- Sidebar expanded header — keep logo+name: Task 2 ✓
- Sidebar collapsed — logo at top: Task 3 ✓
- Sidebar collapsed — nav icons unchanged: Task 3 ✓
- i18n keys used (`collapse_sidebar`, `expand_sidebar`): Tasks 1-3 ✓