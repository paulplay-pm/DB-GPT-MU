# ChatBI Theme System Fix Design

**Date:** 2026-05-28
**Status:** Approved

## Overview

Fix the inconsistent theme (dark/light) switching implementation across ChatBI pages by introducing a CSS variable-based theming system. This ensures all custom components properly respond to the system's theme settings.

## Problem Statement

### Current Issues

1. **Inconsistent Theme Handling**
   - `ChatContext.mode` stores 'dark' | 'light' correctly
   - `_app.tsx` applies `.dark` or `.light` class to `<body>` correctly
   - Only ~15% of pages use Tailwind `dark:` variants
   - Most pages use hardcoded colors that don't adapt to theme

2. **Hardcoded Colors Block Theme Switching**
   - Pages use `#ffffff`, `#f7f7f7`, `#333333` directly
   - No responsive behavior when theme toggles
   - Ant Design components handle dark mode via ConfigProvider, but custom components don't

3. **CSS Variable System Absent**
   - No centralized CSS variable definitions for colors
   - No pattern for theme-aware components

## Design Solution: CSS Variable Theme System

### Architecture

```
body.light / body.dark (applied by CssWrapper)
    └── CSS Variables in :root / .dark
            └── All components use var(--bg-primary), var(--text-primary), etc.
```

### CSS Variable Definitions

**File:** `web/styles/theme.css` (new)

```css
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
}
```

### Component Migration Pattern

**Before (hardcoded):**
```tsx
<div className='bg-white text-gray-800 border border-gray-200 rounded-lg'>
  <div className='bg-gray-50 text-gray-600'>Content</div>
</div>
```

**After (CSS variables):**
```tsx
<div className='bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] rounded-lg'>
  <div className='bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'>Content</div>
</div>
```

### Phase 1: Priority Pages (ChatBI New Pages)

1. `/web/pages/reports/index.tsx`
2. `/web/pages/favorites/index.tsx`
3. `/web/pages/templates/index.tsx`
4. `/web/pages/team/index.tsx`
5. `/web/new-components/common/PageHeader.tsx`
6. `/web/new-components/common/Toolbar.tsx`

### Phase 2: Admin Pages

1. `/web/pages/admin/user.tsx`
2. `/web/pages/admin/role.tsx`
3. `/web/pages/admin/dept.tsx`
4. `/web/pages/admin/permission.tsx`
5. `/web/pages/admin/registration.tsx`

### Ant Design Components

- ConfigProvider in `_app.tsx` already handles Ant Design dark mode via `theme.darkAlgorithm`
- No changes needed for Ant Design component styling
- Only custom-styled elements (custom CSS classes, non-Ant elements) need updates

### Files to Create/Modify

| File | Action |
|------|--------|
| `web/styles/theme.css` | Create - CSS variable definitions |
| `web/styles/globals.css` | Modify - import theme.css, remove old .light/.dark rules |
| `web/pages/reports/index.tsx` | Modify - use CSS variables |
| `web/pages/favorites/index.tsx` | Modify - use CSS variables |
| `web/pages/templates/index.tsx` | Modify - use CSS variables |
| `web/pages/team/index.tsx` | Modify - use CSS variables |
| `web/pages/admin/user.tsx` | Modify - use CSS variables |
| `web/pages/admin/role.tsx` | Modify - use CSS variables |
| `web/pages/admin/dept.tsx` | Modify - use CSS variables |
| `web/pages/admin/permission.tsx` | Modify - use CSS variables |
| `web/pages/admin/registration.tsx` | Modify - use CSS variables |
| `web/new-components/common/PageHeader.tsx` | Modify - use CSS variables |
| `web/new-components/common/Toolbar.tsx` | Modify - use CSS variables |

## Backward Compatibility

- Existing Ant Design components continue to work (ConfigProvider handles them)
- Hardcoded colors that don't use CSS variables will remain unchanged (will not adapt to theme)
- No breaking changes to existing functionality

## Testing Checklist

- [ ] Light mode: all priority pages render correctly
- [ ] Dark mode: all priority pages render correctly
- [ ] Theme toggle: changes apply immediately without page reload
- [ ] Ant Design components: remain correctly styled in both modes
- [ ] No regression: existing pages not in scope continue to work