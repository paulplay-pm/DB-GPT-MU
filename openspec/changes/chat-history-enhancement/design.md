# Chat History Enhancement - Design Doc

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance session list in "我的报告" page with creation time display, rename/pin functionality, and fix summary update behavior.

**Architecture:** Add `is_pinned` field to database, new API endpoints for pin/unpin/rename, and frontend UI updates.

**Tech Stack:** Python (FastAPI, SQLAlchemy), React (Next.js, Ant Design), MySQL

---

## 1. Database Schema

### 1.1 Add `is_pinned` Column

**File:** `assets/schema/upgrade/v0_9_0/dbgpt.sql`

```sql
ALTER TABLE `chat_history` ADD COLUMN `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the session is pinned';
CREATE INDEX `idx_chat_history_is_pinned` ON `chat_history`(`is_pinned`);
```

---

## 2. Backend - Entity and Storage

### 2.1 ChatHistoryEntity

**File:** `packages/dbgpt-core/src/dbgpt/storage/chat_history/chat_history_db.py`

Add `is_pinned` field to the entity class:

```python
class ChatHistoryEntity(BaseModel):
    # ... existing fields ...
    is_pinned: bool = Field(default=False, description="Whether the session is pinned")
```

### 2.2 StorageConversation Adapter

**File:** `packages/dbgpt-core/src/dbgpt/storage/chat_history/storage_adapter.py`

Update `DBStorageConversationItemAdapter.to_storage_format()` to include `is_pinned`:

```python
def to_storage_format(self, item: StorageConversation) -> ChatHistoryEntity:
    # ... existing code ...
    return ChatHistoryEntity(
        # ... existing fields ...,
        is_pinned=item.is_pinned,
    )
```

Update `from_storage_format()` to read `is_pinned`:

```python
def from_storage_format(self, model: ChatHistoryEntity) -> StorageConversation:
    # ... existing code ...
    return StorageConversation(
        # ... existing fields ...,
        is_pinned=model.is_pinned,
    )
```

### 2.3 StorageConversation Class

**File:** `packages/dbgpt-core/src/dbgpt/core/interface/message.py`

Add `is_pinned` property to `StorageConversation.__init__()`:

```python
def __init__(
    self,
    # ... existing params ...,
    is_pinned: bool = False,
    # ... rest ...
):
    # ... existing code ...
    self.is_pinned = is_pinned
```

---

## 3. Backend - API Schema

### 3.1 ServerResponse Schema

**File:** `packages/dbgpt-serve/src/dbgpt_serve/conversation/api/schemas.py`

Add `is_pinned` field:

```python
class ServerResponse(BaseModel):
    # ... existing fields ...
    is_pinned: Optional[bool] = Field(
        default=False,
        description="Whether the session is pinned",
    )
```

### 3.2 ServeDao to_response

**File:** `packages/dbgpt-serve/src/dbgpt_serve/conversation/models/models.py`

Map `is_pinned` in `to_response()`:

```python
def to_response(self, entity: ServeEntity) -> ServerResponse:
    # ... existing code ...
    return ServerResponse(
        # ... existing fields ...,
        is_pinned=entity.is_pinned,
    )
```

### 3.3 Update Query Ordering

**File:** `packages/dbgpt-serve/src/dbgpt_serve/conversation/models/models.py`

Update `get_conv_by_page()` to order by pinned first, then by update time:

```python
def get_conv_by_page(self, req: ServeRequest, page: int, page_size: int):
    with self.session(commit=False) as session:
        query = self._create_query_object(session, req)
        query = query.order_by(
            ServeEntity.is_pinned.desc(),
            ServeEntity.gmt_modified.desc()
        )
        # ... rest of code ...
```

---

## 4. Backend - API Endpoints

### 4.1 New Endpoints

**File:** `packages/dbgpt-serve/src/dbgpt_serve/conversation/api/endpoints.py`

```python
@router.post("/pin")
async def pin_conversation(
    con_uid: str,
    service: Service = Depends(get_service)
):
    """Pin a Conversation entity"""
    service.pin(ServeRequest(conv_uid=con_uid))
    return Result.succ(None)

@router.post("/unpin")
async def unpin_conversation(
    con_uid: str,
    service: Service = Depends(get_service)
):
    """Unpin a Conversation entity"""
    service.unpin(ServeRequest(conv_uid=con_uid))
    return Result.succ(None)

@router.post("/rename")
async def rename_conversation(
    con_uid: str,
    new_summary: str,
    service: Service = Depends(get_service)
):
    """Rename a Conversation entity's summary"""
    service.rename(ServeRequest(conv_uid=con_uid), new_summary)
    return Result.succ(None)
```

### 4.2 Service Methods

**File:** `packages/dbgpt-serve/src/dbgpt_serve/conversation/service/service.py`

```python
def pin(self, request: ServeRequest) -> None:
    """Pin a conversation"""
    conv = self.create_storage_conv(request)
    conv.is_pinned = True
    conv.save_to_storage()

def unpin(self, request: ServeRequest) -> None:
    """Unpin a conversation"""
    conv = self.create_storage_conv(request)
    conv.is_pinned = False
    conv.save_to_storage()

def rename(self, request: ServeRequest, new_summary: str) -> None:
    """Rename a conversation's summary"""
    conv = self.create_storage_conv(request)
    conv.summary = new_summary
    conv.save_to_storage()
```

---

## 5. Frontend - UI Updates

### 5.1 Updated Display Format

**File:** `pages/reports/index.tsx`

Each conversation item should display:

```
┌─────────────────────────────────────────────────────────────────┐
│ [📌] 💬  Summary Title                                    [✏️] [🗑️]
│        更新: 38 minutes ago                                       │
│        创建: 2024-01-07 09:00                                    │
└─────────────────────────────────────────────────────────────────┘
```

- `📌` Pin icon (filled if pinned, outline if not)
- `✏️` Rename icon (appears on hover)
- `🗑️` Delete icon (appears on hover)

### 5.2 New Translations

**Files:** `locales/zh/chat.ts`, `locales/en/chat.ts`

```typescript
// zh
update_time: '更新',
created_at: '创建',

// en
update_time: 'Updated',
created_at: 'Created',
```

### 5.3 API Client Updates

**File:** `client/api/request.ts`

Add new API calls:

```typescript
export const pinDialogue = (convUid: string) => POST('/api/v1/serve/conversation/pin', { conv_uid: convUid });
export const unpinDialogue = (convUid: string) => POST('/api/v1/serve/conversation/unpin', { conv_uid: convUid });
export const renameDialogue = (convUid: string, newSummary: string) => POST('/api/v1/serve/conversation/rename', { conv_uid: convUid, new_summary: newSummary });
```

### 5.4 ConversationsTab Component Changes

**File:** `pages/reports/index.tsx`

1. **State additions:**
   - `pinnedId` - tracks currently pinned conv_uid
   - `editingId` - tracks which conv is being renamed
   - `editValue` - tracks the rename input value

2. **Display update:**
   - Show "更新: {formatTime(gmt_modified)}" instead of "38 minutes ago"
   - Show "创建: {formatAbsoluteTime(gmt_created)}"

3. **New handlers:**
   - `handlePin(conv)` - toggle pin state
   - `handleRename(conv)` - enter rename mode
   - `handleRenameConfirm(convUid)` - save rename
   - `handleRenameCancel()` - cancel rename

4. **Inline rename UI:**
   - When `editingId === conv.conv_uid`, show Input instead of title
   - Confirm/Cancel buttons

---

## 6. Summary Update Behavior

### 6.1 Lock Summary to First Message

**File:** `packages/dbgpt-core/src/dbgpt/core/interface/message.py`

Modify `StorageConversation.save_to_storage()` to NOT update `summary` if it's already set:

```python
def save_to_storage(self) -> None:
    # ... message saving code ...

    # Save conversation
    if self.summary is not None and len(self.summary) > 4000:
        self.summary = self.summary[0:4000]

    # Only update summary if it's empty (first message).
    # Once set, summary should only change via explicit rename.
    if not self.summary:
        latest_user_message = self.get_latest_user_message()
        if latest_user_message:
            self.summary = latest_user_message.last_text[:250] if latest_user_message.last_text else self.summary

    self.conv_storage.save_or_update(self)
```

**Note:** The logic needs to handle the case where summary might be set from storage on load. We only want to set from latest user message if summary is truly empty AND we have a new message.

Actually, a better approach: check if we have stored messages already. If yes, don't update summary on subsequent saves.

```python
def save_to_storage(self) -> None:
    # ... message saving code ...

    if self.summary is not None and len(self.summary) > 4000:
        self.summary = self.summary[0:4000]

    # Only set summary from latest message if:
    # 1. Summary is empty (new conversation), OR
    # 2. We have never saved to storage before (_has_stored_message_index == -1)
    if not self.summary or self._has_stored_message_index == -1:
        latest_user_message = self.get_latest_user_message()
        if latest_user_message:
            self.summary = latest_user_message.last_text[:250] if latest_user_message.last_text else self.summary

    self.conv_storage.save_or_update(self)
```

Wait, `_has_stored_message_index` is initialized to `len(messages) - 1` which could be -1 for empty list. But on subsequent saves, it gets updated. The key insight is: if summary is already set from a previous save, we should NOT overwrite it.

Let me reconsider. The issue is:
- First message: summary should be set from user_input
- Subsequent messages: summary should NOT change automatically
- User rename: summary changes to user-provided value

A cleaner approach:

```python
def save_to_storage(self) -> None:
    # ... message saving code ...

    if self.summary is not None and len(self.summary) > 4000:
        self.summary = self.summary[0:4000]

    # Check if this is the first save (no messages stored yet)
    # OR if summary was never set
    is_first_save = self._has_stored_message_index == -1 or not self.summary

    if is_first_save:
        latest_user_message = self.get_latest_user_message()
        if latest_user_message:
            self.summary = latest_user_message.last_text[:250] if latest_user_message.last_text else self.summary

    self.conv_storage.save_or_update(self)
```

---

## 7. Implementation Tasks

### Task 1: Database Schema
- [ ] Create `assets/schema/upgrade/v0_9_0/dbgpt.sql` with `is_pinned` column

### Task 2: Backend Entity Updates
- [ ] Add `is_pinned` to `ChatHistoryEntity`
- [ ] Update `StorageConversation` to include `is_pinned`
- [ ] Update storage adapter `to_storage_format` and `from_storage_format`

### Task 3: Backend API Schema
- [ ] Add `is_pinned` to `ServerResponse` schema
- [ ] Update `ServeDao.to_response()` to map `is_pinned`
- [ ] Update `get_conv_by_page()` ordering

### Task 4: Backend Service and Endpoints
- [ ] Add `pin()`, `unpin()`, `rename()` methods to Service
- [ ] Add `/pin`, `/unpin`, `/rename` endpoints
- [ ] Add frontend API client functions

### Task 5: Summary Lock Logic
- [ ] Modify `StorageConversation.save_to_storage()` to only set summary on first save

### Task 6: Frontend UI
- [ ] Add translations for "更新" and "创建"
- [ ] Update display format with absolute datetime
- [ ] Add pin/unpin button and logic
- [ ] Add inline rename input and logic

---

## 8. Testing Plan

### 8.1 Backend Tests
- [ ] Test `/pin` endpoint sets `is_pinned=True`
- [ ] Test `/unpin` endpoint sets `is_pinned=False`
- [ ] Test `/rename` endpoint updates summary
- [ ] Test conversation list ordering (pinned first)

### 8.2 Frontend Tests
- [ ] Verify update time displays "更新: x minutes ago"
- [ ] Verify creation time displays "创建: yyyy-mm-dd hh:mm"
- [ ] Test pin/unpin toggles and UI updates
- [ ] Test inline rename flow

### 8.3 Summary Behavior Tests
- [ ] Create new conversation, verify summary = first user input
- [ ] Send more messages, verify summary does NOT change
- [ ] Rename summary, verify it changes and stays changed
- [ ] Reload conversation, verify summary persists