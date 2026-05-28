# ChatBI i18n Fix Design

**Date:** 2026-05-28
**Status:** Draft

## Overview

Fix internationalization (i18n) issues in ChatBI admin pages by wrapping hardcoded Chinese strings with `t('key')` calls and adding missing i18n translation keys to locale files.

## Problem Statement

### Current Issues

1. **Hardcoded Chinese strings in admin pages**
   - Admin pages (user, role, dept, permission, registration) contain hardcoded Chinese text
   - Example: `const [modalTitle, setModalTitle] = useState('新增用户')` instead of `useState(t('Add_User'))`
   - When language is switched to English, these strings remain Chinese

2. **Missing i18n keys**
   - Some UI strings lack corresponding translation keys
   - Users see mixed Chinese/English when locale coverage is incomplete

### Root Cause

- i18n is properly configured with `react-i18next` and locale files in `web/locales/`
- Admin pages imported `useTranslation` hook correctly
- But developers wrote hardcoded Chinese strings instead of using `t('key')` pattern
- Some keys are missing from `web/locales/en/common.ts` and `web/locales/zh/common.ts`

## Design Solution

### Scope

**Files to Fix (admin pages):**
- `web/pages/admin/user.tsx`
- `web/pages/admin/role.tsx`
- `web/pages/admin/dept.tsx`
- `web/pages/admin/permission.tsx`
- `web/pages/admin/registration.tsx`

**Locale files to update:**
- `web/locales/en/common.ts`
- `web/locales/zh/common.ts`

### Translation Key Naming Convention

Follow existing pattern from locale files:
- Use snake_case: `Add_User`, `Edit_User`, `Delete_User`, `Confirm_Delete`
- Group related keys with prefixes: `User_*`, `Role_*`, `Dept_*`, `Permission_*`, `Registration_*`
- Status keys: `Status_Active`, `Status_Inactive`
- Button keys: `Add`, `Edit`, `Delete`, `Submit`, `Cancel`, `Confirm`, `Save`

### Migration Pattern

**Before (hardcoded Chinese):**
```tsx
const [modalTitle, setModalTitle] = useState('新增用户');
```

**After (i18n):**
```tsx
const { t } = useTranslation();
// ...
const [modalTitle, setModalTitle] = useState(t('Add_User'));
```

**For conditional display:**
```tsx
{mode === 'add' ? t('Add_User') : t('Edit_User')}
```

### Files to Create/Modify

| File | Action |
|------|--------|
| `web/pages/admin/user.tsx` | Wrap hardcoded strings with t('key') |
| `web/pages/admin/role.tsx` | Wrap hardcoded strings with t('key') |
| `web/pages/admin/dept.tsx` | Wrap hardcoded strings with t('key') |
| `web/pages/admin/permission.tsx` | Wrap hardcoded strings with t('key') |
| `web/pages/admin/registration.tsx` | Wrap hardcoded strings with t('key') |
| `web/locales/en/common.ts` | Add missing English translation keys |
| `web/locales/zh/common.ts` | Add missing Chinese translation keys |

### Ant Design Components

- Ant Design components (Table, Modal, Form, etc.) use built-in internationalization
- No changes needed for Ant Design built-in labels
- Only custom text strings need wrapping

### Backward Compatibility

- Existing translation keys remain unchanged
- New keys added without affecting existing functionality
- Fallback strings already handled by react-i18next

## Testing Checklist

- [ ] Language toggle (Chinese/English) changes all admin page strings
- [ ] No hardcoded Chinese strings remain in admin pages
- [ ] No missing translation keys cause console warnings
- [ ] Modal titles, button labels, form labels all switch correctly