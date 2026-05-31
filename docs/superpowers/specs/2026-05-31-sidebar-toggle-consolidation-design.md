# Sidebar Toggle Consolidation Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate sidebar collapse/expand toggle into TopActionBar. Remove duplicate toggle buttons from sidebar. When sidebar is collapsed, show logo in sidebar top area (not in TopActionBar).

**Architecture:** Single toggle control in TopActionBar (hamburger icon). Sidebar header shows logo when collapsed, brand name when expanded.

---

## Layout Structure

### Expanded Sidebar
```
┌────────────────┬─────────────────────────────────────┐
│ [logo] [名称]  │                                     │
│                │                                     │
│   Nav Items    │         Main Content                 │
│                │                                     │
│   [UserBar]    │                                    │
└────────────────┴─────────────────────────────────────┘
TopActionBar: [☰ collapse] [breadcrumb]  [?] [🔔] [+]
```

### Collapsed Sidebar
```
┌──────┬──────────────────────────────────────────────┐
│ Logo │                                            │
│(顶部)├─────────────────────────────────────────────┤
│      │                                            │
│ Icon │         Main Content                       │
│ Menu │                                            │
│      │                                            │
│[User]│                                            │
└──────┴─────────────────────────────────────────────┘
TopActionBar: [☰ expand] [breadcrumb]  [?] [🔔] [+]
```

---

## Component Changes

### 1. TopActionBar (`web/new-components/layout/TopActionBar/index.tsx`)

- **Hamburger button**: Always visible on far left
  - When sidebar expanded: `MenuOutlined` icon + tooltip `collapse_sidebar`
  - When sidebar collapsed: `MenuOutlined` icon + tooltip `expand_sidebar`
- **No logo display**: Remove conditional logo logic — logo only in sidebar when collapsed
- **Breadcrumb**: After hamburger, not centered
- **Right actions**: Help, Notification, New Chat (unchanged)

### 2. NewSideBar Expanded Header (`web/components/layout/NewSideBar/index.tsx`)

- **Remove**: Collapse button area (lines ~373-379 in current code)
- **Keep**: Logo + brand name display
- **Behavior**: Nav items and functionality unchanged

### 3. NewSideBar Collapsed State (`web/components/layout/NewSideBar/index.tsx`)

- **Replace expand button area**: Instead of `AppstoreOutlined` expand button, show logo area at top of collapsed sidebar
  - If `brandConfig.logo_url` exists: show logo image (no product name)
  - Else: show gradient circle avatar with first letter of `product_name_zh` (Chinese) or `product_name_en` (English)
- **Nav icons area**: Remains unchanged below the logo area

---

## i18n Keys

No new keys required. Existing keys already in place:
- `collapse_sidebar` — tooltip when sidebar is expanded
- `expand_sidebar` — tooltip when sidebar is collapsed

---

## Files to Modify

| File | Change |
|------|--------|
| `web/new-components/layout/TopActionBar/index.tsx` | Hamburger always visible; remove conditional logo; breadcrumb positioning |
| `web/components/layout/NewSideBar/index.tsx` | Remove collapse button from expanded header; replace expand button with logo area in collapsed state |

---

## Implementation Notes

- Toggle state managed via `ChatContext.isMenuExpand` + `setIsMenuExpand` (already exists)
- TopActionBar hamburger click calls `setIsMenuExpand(!isMenuExpand)`
- Sidebar reads `isMenuExpand` to determine expanded/collapsed layout
- When collapsed, sidebar top logo area is independent of icon menu area — does not shift or resize nav items