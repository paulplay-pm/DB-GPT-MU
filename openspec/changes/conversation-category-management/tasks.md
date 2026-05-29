# Conversation Category Management - Implementation Tasks

## Context

Complete redesign of reports page (`web/pages/reports/index.tsx`) with:
- Three-column layout: category panel (left 224px) + conversation list (right) + batch action bar
- Custom category CRUD (create/rename/delete)
- Conversation-to-category assignment (1 conversation = 1 category)
- Three move methods: right-click menu, batch mode, drag-drop to category panel
- Pinned section at top, "更早的会话" separator, category count badges
- Database: `conversation_categories` table + `category_id` FK in `chat_history`

**Backend:** Python/FastAPI (`dbgpt-serve/`)
**Frontend:** Next.js/React/TypeScript (`web/pages/reports/index.tsx`)

---

## Task 1: Database Migration

**Files:**
- Create: `pilot/schema/migration/2026-05-29_conversation_categories.sql`

- [ ] **Step 1: Create migration SQL script**

```sql
-- Create conversation_categories table
CREATE TABLE IF NOT EXISTS conversation_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(128) NOT NULL,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
    gmt_created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_name (user_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add category_id to chat_history
ALTER TABLE chat_history
ADD COLUMN category_id INT DEFAULT NULL,
ADD CONSTRAINT fk_chat_history_category
FOREIGN KEY (category_id) REFERENCES conversation_categories(category_id)
ON DELETE SET NULL;

-- Existing conversations have category_id = NULL (belong to "未分类")
```

- [ ] **Step 2: Test migration locally**

Run migration against local database and verify:
- `conversation_categories` table created with correct schema
- `chat_history` has new `category_id` column
- Existing rows have `category_id = NULL`

---

## Task 2: Backend - Category CRUD API

**Files:**
- Create: `packages/dbgpt-serve/src/dbgpt_serve/conversation/category_service.py`
- Create: `packages/dbgpt-serve/src/dbgpt_serve/conversation/category_api.py`
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/conversation/__init__.py` (add router)

- [ ] **Step 1: Create CategoryService**

```python
# category_service.py
from typing import List, Optional
from sqlalchemy import select, update, delete
from sqlalchemy.orm import Session
from dbgpt_serve.conversation.models import ConversationCategory

class CategoryService:
    def create_category(self, db: Session, user_name: str, name: str, color: str) -> ConversationCategory:
        # Create and return new category

    def get_user_categories(self, db: Session, user_name: str) -> List[ConversationCategory]:
        # Return user's custom categories sorted by gmt_created ASC

    def rename_category(self, db: Session, category_id: int, user_name: str, name: str) -> Optional[ConversationCategory]:
        # Update category name, verify ownership, return updated

    def delete_category(self, db: Session, category_id: int, user_name: str) -> bool:
        # Delete category, conversations move to 未分类 (category_id=NULL)

    def move_conversations(self, db: Session, conv_uids: List[str], category_id: Optional[int], user_name: str) -> int:
        # Move conversations to category (or to 未分类 if category_id=None)
        # Returns count of updated conversations
```

- [ ] **Step 2: Create API endpoints**

```python
# category_api.py
POST /conversation/category/create
PUT /conversation/category/{category_id}/rename
DELETE /conversation/category/{category_id}
GET /conversation/category/list?user_name=xxx
POST /conversation/category/move
```

- [ ] **Step 3: Add unit tests**

Create `tests/dbgpt_serve/conversation/test_category_service.py` with:
- Test create category
- Test rename category
- Test delete category (conversations moved to NULL)
- Test move single conversation
- Test move multiple conversations
- Test permission (user A cannot access user B's category)

---

## Task 3: Backend - Update query_page to Support category_id Filter

**Files:**
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/conversation/chat_history_service.py`
- Modify: `packages/dbgpt-serve/src/dbgpt_serve/conversation/chat_history_api.py`

- [ ] **Step 1: Update service layer**

Add `category_id` parameter to `query_page`:
```python
async def query_page(
    self,
    user_name: str,
    category_id: Optional[int] = None,  # NEW: filter by category
    is_pinned: Optional[bool] = None,
    keyword: Optional[str] = None,
    chat_mode: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> List[ChatHistory]:
    # Filter by category_id (NULL for "未分类")
    # Filter by is_pinned if provided
    # Search by keyword (title + summary) if provided
```

- [ ] **Step 2: Update API layer**

Add `category_id` query parameter to `GET /conversation/chat_history/query_page`.

---

## Task 4: Frontend - Reports Page Layout Shell

**Files:**
- Modify: `web/pages/reports/index.tsx` (complete rewrite)

- [ ] **Step 1: Create three-column layout**

```tsx
// Basic structure
<div className="flex h-full">
  {/* Left: Category Panel (224px) */}
  <CategoryPanel />

  {/* Right: Conversation List (flex-1) */}
  <div className="flex-1 flex flex-col">
    <Toolbar />
    <BatchActionBar /> {/* only visible in batch mode */}
    <ConversationList />
  </div>
</div>
```

- [ ] **Step 2: Set up DnDContext**

```tsx
const DnDContext = createContext<{
  draggingConvUid: string | null;
  draggingOverCategoryId: number | null;
}>({ draggingConvUid: null, draggingOverCategoryId: null });

// Wrap entire page with DnDContext.Provider
```

- [ ] **Step 3: Verify layout renders**

Navigate to `/reports` and verify three-column layout displays.

---

## Task 5: Frontend - CategoryPanel Component

**Files:**
- Create: `web/components/CategoryPanel/index.tsx`
- Create: `web/components/CategoryPanel/SystemCategories.tsx`
- Create: `web/components/CategoryPanel/CustomCategories.tsx`
- Create: `web/components/CategoryPanel/CreateCategoryModal.tsx`
- Create: `web/components/CategoryPanel/MoreMenu.tsx`

- [ ] **Step 1: Create main CategoryPanel component**

Implement:
- Panel header: "会话分类" + "+" button
- System categories: 全部会话, 已置顶, 未分类
- Custom categories list with count badges
- Active state with 3px purple left border indicator
- Hover state shows "..." more button (custom only)
- "+" button opens CreateCategoryModal

- [ ] **Step 2: Create SystemCategories component**

```tsx
interface SystemCategory {
  id: 'all' | 'pinned' | 'uncategorized';
  label: string;  // i18n key
  icon: React.ReactNode;
}
```

- [ ] **Step 3: Create CustomCategories component**

```tsx
interface CategoryItem {
  category_id: number;
  name: string;
  color: string;
  conv_count: number;
}
```

- [ ] **Step 4: Create CreateCategoryModal component**

Implement:
- Modal centered, 380px width, 16px border-radius
- Title "新建分类", subtitle "创建一个分类来组织你的会话记录"
- Name input (placeholder "例如：销售分析、周报汇总...", max 20 chars)
- Color picker: 7 preset colors with ring highlight on selected
- Cancel (gray text) and Create (purple filled) buttons
- Create button disabled when name empty or duplicate

- [ ] **Step 5: Create MoreMenu component**

Dropdown menu on "..." click:
- 重命名 (rename) → inline edit
- 删除分类 (delete) → confirm modal

- [ ] **Step 6: Test CategoryPanel**

- Panel renders with system categories
- Clicking category shows active state (purple left border)
- "+" opens modal
- Hover on custom category shows more button
- Category count badges update

---

## Task 6: Frontend - ConversationList Component

**Files:**
- Create: `web/components/ConversationList/index.tsx`
- Create: `web/components/ConversationList/Toolbar.tsx`
- Create: `web/components/ConversationList/BatchActionBar.tsx`
- Create: `web/components/ConversationList/ConversationCard.tsx`
- Create: `web/components/ConversationList/EmptyState.tsx`
- Create: `web/components/ConversationList/SkeletonCard.tsx`

- [ ] **Step 1: Create ConversationList component**

```tsx
interface ConversationListProps {
  categoryId: number | 'all' | 'pinned' | 'uncategorized' | null;
}
```

Implement:
- Fetch conversations when categoryId changes
- Show pinned section at top
- Show "更早的会话" separator when pinned section has items and normal section has items
- Show empty state when no conversations
- Show skeleton loading when fetching

- [ ] **Step 2: Create Toolbar component**

```tsx
// Search input (real-time filtering, no enter needed)
// "批量管理" button (purple outline when active)
```

- [ ] **Step 3: Create BatchActionBar component**

Visible only in batch mode:
```tsx
// "已选 N 项" counter
// "移动到分类" button (white bg, purple border)
// "置顶" button
// "删除" button (red border)
// "取消" button (exit batch mode)
```

- [ ] **Step 4: Create ConversationCard component**

```tsx
interface ConversationCardProps {
  conv: {
    conv_uid: string;
    title: string;
    summary: string;  // content summary, gray small text
    gmt_modified: string;
    gmt_created: string;
    is_pinned: boolean;
    chat_mode: string;
    category_id: number | null;
    category_name?: string;
    category_color?: string;
  };
}
```

Card displays:
- Category badge (top-left, colored rounded label, hidden if uncategorized)
- Pinned icon (yellow pin before badge if is_pinned)
- Title (single line, ellipsis overflow)
- Content summary (gray, small, 2 lines max)
- Time info: "更新于 X 小时前" + "创建于 YYYY-MM-DD HH:mm"
- More button ("..." right side)

Hover effect:
- Card lifts 1px (transform: translateY(-1px))
- Shadow deepens
- Border turns purple

Click → navigate with smart routing:
- chat_react_agent → `/?id=${convUid}&title=...`
- other → `/chat?scene=${chat_mode}&id=${convUid}&title=...`

Drag enabled (except in batch mode):
- onDragStart: set draggingConvUid in DnDContext
- onDragEnd: clear DnDContext

- [ ] **Step 5: Create EmptyState component**

```tsx
// Centered document icon
// Text: "该分类下暂无会话记录"
```

- [ ] **Step 6: Create SkeletonCard component**

Gray pulse animation (Skeleton from antd) at each card position.

- [ ] **Step 7: Test ConversationList**

- Switch category → list updates
- Search filters list in real-time
- Batch mode shows checkboxes and action bar
- Empty state displays for empty category
- Skeleton shows during loading

---

## Task 7: Frontend - Search Functionality

**Files:**
- Modify: `web/components/ConversationList/index.tsx`

- [ ] **Step 1: Implement real-time search**

```tsx
// In Toolbar: onChange handler updates searchKeyword state
// In ConversationList: filter conversations by keyword
//   matching title OR summary (case-insensitive)
// Search is scoped to current category (联动当前分类)
```

- [ ] **Step 2: Test search**

- Type in search box → list filters immediately
- Clear search → all conversations in category show
- Search with different categories → each category's list is filtered

---

## Task 8: Frontend - Batch Operations

**Files:**
- Modify: `web/components/ConversationList/index.tsx`
- Modify: `web/components/ConversationList/BatchActionBar.tsx`
- Create: `web/components/MoveCategoryModal/index.tsx`

- [ ] **Step 1: Implement batch mode state**

```tsx
const [batchMode, setBatchMode] = useState(false);
const [selectedConvUids, setSelectedConvUids] = useState<Set<string>>(new Set());
```

- [ ] **Step 2: Click "批量管理" → enter batch mode**

Show checkboxes on each card, show BatchActionBar.

- [ ] **Step 3: Implement select all / deselect all**

"全选" checkbox in BatchActionBar.

- [ ] **Step 4: Create MoveCategoryModal component**

```tsx
interface MoveCategoryModalProps {
  visible: boolean;
  selectedCount: number;
  onMove: (categoryId: number | null) => void;  // null = move to 未分类
  onCancel: () => void;
}
```

Shows:
- Title: "移动到分类" with count
- List of custom categories (name + color dot)
- "未分类" option at bottom
- Cancel button

- [ ] **Step 5: Implement batch operations**

```tsx
// 移动到分类: opens MoveCategoryModal, calls move API
// 置顶: calls pin API for all selected
// 删除: confirm dialog, then calls delete API
// 取消: exit batch mode, clear selections
```

- [ ] **Step 6: Test batch operations**

- Enter batch mode
- Select multiple conversations
- Move to category → verify category_id updated
- Pin selected → verify is_pinned updated
- Delete selected → verify conversations deleted
- Cancel → exit batch mode

---

## Task 9: Frontend - Drag and Drop

**Files:**
- Modify: `web/components/CategoryPanel/index.tsx` (drop target)
- Modify: `web/components/ConversationList/ConversationCard.tsx` (draggable)

- [ ] **Step 1: Implement drag start**

```tsx
// onDragStart on card
// Set draggingConvUid in DnDContext
// Card gets reduced opacity and deeper shadow
```

- [ ] **Step 2: Implement drag over for CategoryPanel**

```tsx
// onDragOver on CategoryPanel (specifically on each custom category item)
// Update draggingOverCategoryId in DnDContext
// Show drop highlight (purple bg + left border indicator)
```

- [ ] **Step 3: Implement drop**

```tsx
// onDrop on custom category item
// Call POST /conversation/category/move with conv_uids and category_id
// Clear DnDContext
// Update conversation list and category badge
```

- [ ] **Step 4: Implement drag end (cleanup)**

```tsx
// onDragEnd on card
// If dropped on non-category area, just clear DnDContext
// If dropped on system category, show error toast "系统分类不支持拖拽放置"
```

- [ ] **Step 5: Disable drag in batch mode**

```tsx
// In batch mode: ConversationCard draggable = false
// Card doesn't show grab cursor
```

- [ ] **Step 6: Test drag and drop**

- Drag card to custom category → conversation moves
- Drag card to system category → error toast
- Drag card to empty area → no change
- In batch mode: drag disabled

---

## Task 10: Frontend - i18n and Theme Support

**Files:**
- Modify: `web/components/CategoryPanel/*.tsx` (add i18n keys)
- Modify: `web/components/ConversationList/*.tsx` (add i18n keys)

- [ ] **Step 1: Add i18n keys**

Category panel:
- "会话分类" (category panel title)
- "全部会话" / "已置顶" / "未分类" (system categories)
- "新建分类" / "创建一个分类来组织你的会话记录"
- "取消" / "创建"
- "重命名" / "删除分类"
- "删除后，该分类下的会话将移动到"未分类"，是否继续？"

Conversation list:
- "批量管理" / "已选 N 项"
- "移动到分类" / "置顶" / "删除"
- "更早的会话"
- "该分类下暂无会话记录"
- "更新于 X 小时前"

- [ ] **Step 2: Test i18n**

Switch language → all labels update.

- [ ] **Step 3: Test theme**

Switch to dark mode → panel and list colors update.

---

## Task 11: Integration Testing

**Files:**
- Test: Manual end-to-end test

- [ ] **Step 1: Database migration**

Verify migration runs without errors.

- [ ] **Step 2: Category CRUD**

- Create new category with name and color
- Rename category
- Delete category (conversations move to 未分类)

- [ ] **Step 3: Conversation operations**

- View all conversations
- Filter by category
- Search conversations
- Move conversation to category (3 ways)
- Pin/unpin conversation
- Batch select and operate

- [ ] **Step 4: Frontend routing**

- Click chat_react_agent conversation → opens `/`
- Click other type conversation → opens `/chat?scene=...`

---

## Checklist

- [ ] Task 1: Database Migration
- [ ] Task 2: Backend - Category CRUD API
- [ ] Task 3: Backend - Update query_page
- [ ] Task 4: Frontend - Reports Page Layout Shell
- [ ] Task 5: Frontend - CategoryPanel Component
- [ ] Task 6: Frontend - ConversationList Component
- [ ] Task 7: Frontend - Search Functionality
- [ ] Task 8: Frontend - Batch Operations
- [ ] Task 9: Frontend - Drag and Drop
- [ ] Task 10: Frontend - i18n and Theme Support
- [ ] Task 11: Integration Testing