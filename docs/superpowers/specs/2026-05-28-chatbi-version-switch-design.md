# ChatBI Version Switching & Reports Enhancement Design

**Date:** 2026-05-28
**Status:** Approved

## Overview

Enhance the DB-GPT ChatBI frontend with:
1. Version switching (Old/New UI toggle in sidebar)
2. Language and theme switching in UserBar dropdown
3. Reports page showing conversation history alongside report cards
4. Favorites page implementation

---

## Design A: Version Switching Toggle

### Location
Sidebar header area, right of the Logo.

### Implementation
- Add a `Segment` control with two options: "老版本" (Old) and "新版本" (New)
- **Old version** → navigates to `/chat` (existing chat page)
- **New version** → navigates to `/` (ChatBI home page)
- State stored in `localStorage` key `CHATBI_VERSION_KEY`
- Default to New version if not set

### UI Behavior
- Toggle visible in both expanded and collapsed sidebar
- When collapsed, toggle shows icon-only
- Switching versions triggers `router.push` to appropriate landing page
- Persists across sessions

### File Changes
- `web/components/layout/NewSideBar/index.tsx` - Add version toggle in header

---

## Design B: Language & Theme Switcher in UserBar

### Location
UserBar dropdown menu (bottom of sidebar).

### Implementation
- Existing `UserBar` component to be enhanced with dropdown menu
- Dropdown items:
  - **Language section**: 中文 / English (radio selection)
  - **Theme section**: 浅色 / 深色 (radio selection)
- Language switch calls `i18n.changeLanguage()` and persists to `localStorage`
- Theme switch updates `ChatContext.mode` and persists to `localStorage`

### UI Behavior
- Click on user avatar or info card reveals dropdown
- Dropdown closes on outside click
- Changes apply immediately without page reload

### File Changes
- `web/new-components/layout/UserBar.tsx` - Add dropdown with language/theme options

---

## Design C: Reports Page with Conversation History

### Location
`/web/pages/reports/index.tsx`

### Implementation
- Tab-based layout with two tabs:
  - Tab 1: "我的报告" (My Reports) - grid of report cards
  - Tab 2: "会话记录" (Conversation History) - list of all chat sessions
- Both tabs share: PageHeader, Toolbar (search)
- Tab state stored in component local state

### Tab 1: My Reports
- Grid display of report cards (when data available)
- Card shows: preview, title, metadata (date, type)
- Empty state shows "暂无报告"

### Tab 2: Conversation History
- Reuse logic from `/web/pages/conversations/index.tsx`
- List view with:
  - Chat icon
  - Title (from `user_input` or "新对话")
  - Timestamp (relative format via `moment`)
  - Delete action (with confirmation)
- Search filter
- Pagination (20 per page)
- Click navigates to chat with that conversation ID

### File Changes
- `web/pages/reports/index.tsx` - Convert to tab-based layout
- Share conversation list logic with `conversations/index.tsx`

---

## Design D: Favorites Page Implementation

### Location
`/web/pages/favorites/index.tsx`

### Implementation
- Page structure similar to reports: PageHeader + Toolbar + Content
- Content: Grid of favorite cards or empty state
- Each card shows: icon, title, description, timestamp
- Empty state with illustration and "暂无收藏" message

### File Changes
- `web/pages/favorites/index.tsx` - Implement card grid layout
- No backend API assumed yet - shows empty state or mock data

---

## Implementation Order

1. **Version Toggle** - Add to NewSideBar header (lowest risk, visible immediately)
2. **UserBar Enhancement** - Add language/theme dropdown (depends on i18n context)
3. **Reports Page** - Tab layout + conversation history tab
4. **Favorites Page** - Card grid with empty state

---

## Key Files

| File | Change |
|------|--------|
| `web/components/layout/NewSideBar/index.tsx` | Version toggle in header |
| `web/new-components/layout/UserBar.tsx` | Language/theme dropdown |
| `web/pages/reports/index.tsx` | Tab layout + conversation tab |
| `web/pages/favorites/index.tsx` | Card grid implementation |

---

## Backward Compatibility

- Old version routes (`/chat`, `/conversations`, etc.) remain fully functional
- Version switch only changes which landing page the user sees
- All existing functionality preserved