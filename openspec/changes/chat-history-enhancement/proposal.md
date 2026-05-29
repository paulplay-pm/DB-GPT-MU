# Chat History Enhancement - Session List Improvements

## Status

Proposed

## Motivation

The "我的报告" (My Reports) page's "会话记录" (Session History) tab needs the following improvements:

1. **Display creation time**: Show when each conversation was created
2. **Rename capability**: Allow users to rename session summaries
3. **Pin capability**: Allow users to pin important sessions to the top
4. **Summary update behavior**: Summary should only be set from the first user input, not updated on subsequent messages
5. **Display update time**: Show "更新: x minutes ago" based on `gmt_modified`

## Technical Background

### Current State

- `chat_history` table has fields: `conv_uid`, `chat_mode`, `summary`, `user_name`, `messages`, `message_ids`, `app_code`, `sys_code`, `gmt_created`, `gmt_modified`
- Frontend uses `user_input` from API response, which maps to `summary` field
- `summary` is currently updated to latest user message on each save

### Data Flow

```
Frontend (pages/reports/index.tsx)
    │
    │ getDialogueListPaged → /api/v1/serve/conversation/query_page
    ▼
Backend (packages/dbgpt-serve/src/dbgpt_serve/conversation/)
    │
    │ ServeDao.get_conv_by_page() → SELECT from chat_history
    ▼
Database (chat_history table)
```

## Proposed Changes

### 1. Database Schema - Add `is_pinned` Column

```sql
ALTER TABLE `chat_history` ADD COLUMN `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the session is pinned';
CREATE INDEX `idx_chat_history_is_pinned` ON `chat_history`(`is_pinned`);
```

**Files:**
- Create: `assets/schema/upgrade/v0_9_0/dbgpt.sql`

### 2. Backend - Entity and Schema Updates

**Files:**
- `packages/dbgpt-core/src/dbgpt/storage/chat_history/chat_history_db.py`
- `packages/dbgpt-serve/src/dbgpt_serve/conversation/api/schemas.py`
- `packages/dbgpt-serve/src/dbgpt_serve/conversation/models/models.py`

**Changes:**
- `ChatHistoryEntity` - add `is_pinned` field
- `ServerResponse` - add `is_pinned` field
- `ServeDao.to_response()` - map `is_pinned` field
- `ServeDao.get_conv_by_page()` - order by `is_pinned DESC, gmt_modified DESC`

### 3. Backend - New API Endpoints

**File:** `packages/dbgpt-serve/src/dbgpt_serve/conversation/api/endpoints.py`

**New Endpoints:**
- `POST /pin?conv_uid=<uid>` - Pin a conversation
- `POST /unpin?conv_uid=<uid>` - Unpin a conversation
- `POST /rename` - Rename a conversation's summary

```python
@router.post("/pin")
async def pin_conversation(con_uid: str, service: Service = Depends(get_service)):
    """Pin a Conversation entity"""
    service.pin(ServeRequest(conv_uid=con_uid))
    return Result.succ(None)

@router.post("/unpin")
async def unpin_conversation(con_uid: str, service: Service = Depends(get_service)):
    """Unpin a Conversation entity"""
    service.unpin(ServeRequest(conv_uid=con_uid))
    return Result.succ(None)

@router.post("/rename")
async def rename_conversation(con_uid: str, new_summary: str, service: Service = Depends(get_service)):
    """Rename a Conversation entity's summary"""
    service.rename(ServeRequest(conv_uid=con_uid), new_summary)
    return Result.succ(None)
```

**Service Methods (service/service.py):**
- `pin(request)` - Set `is_pinned=True`
- `unpin(request)` - Set `is_pinned=False`
- `rename(request, new_summary)` - Update `summary` field

### 4. Frontend - UI Updates

**File:** `pages/reports/index.tsx` (ConversationsTab component)

**Changes:**

1. **Display format:**
   ```
   [Pin Icon] [Message Icon]  Title (summary)
                           更新: 38 minutes ago
                           创建: 2024-01-07 09:00:00
                           [Rename] [Delete]
   ```

2. **Add Pin functionality:**
   - Hover reveals pin icon
   - Click pin icon → call `/pin` or `/unpin` API
   - Pinned items float to top of list

3. **Add Rename functionality:**
   - Hover reveals rename icon
   - Click opens inline edit input
   - Confirm → call `/rename` API
   - Cancel → revert

4. **Update time display:**
   - Change to "更新: x minutes ago" from `gmt_modified`
   - Add "创建: yyyy-mm-dd hh:mm" from `gmt_created`

### 5. Backend - Summary Update Logic (Lock First Summary)

**File:** `packages/dbgpt-core/src/dbgpt/core/interface/message.py`

**Change:** `StorageConversation.save_to_storage()` should only set `summary` from `user_input` if `summary` is currently empty (first message). Once set, do not update `summary` on subsequent saves.

```python
# Current (problematic):
if self.summary is not None and len(self.summary) > 4000:
    self.summary = self.summary[0:4000]
self.conv_storage.save_or_update(self)

# Proposed:
if self.summary is not None and len(self.summary) > 4000:
    self.summary = self.summary[0:4000]
# Only update summary if it's empty (first message)
# Don't update on subsequent messages
self.conv_storage.save_or_update(self)
```

**Note:** The actual fix may need to track whether this is the first message. The current `save_to_storage()` appends messages incrementally, so we need to check if `summary` is already set and skip the update if so.

## Schema

**Conversation Response Schema:**
```
ServerResponse {
  conv_uid: string
  user_input: string (maps to summary)
  chat_mode: string
  app_code: string?
  select_param: string?
  model_name: string?
  user_name: string?
  sys_code: string?
  gmt_created: string?
  gmt_modified: string?
  is_pinned: boolean?
}
```

## Files Summary

| File | Change Type |
|------|-------------|
| `assets/schema/upgrade/v0_9_0/dbgpt.sql` | Create |
| `packages/dbgpt-core/src/dbgpt/storage/chat_history/chat_history_db.py` | Modify |
| `packages/dbgpt-serve/src/dbgpt_serve/conversation/api/schemas.py` | Modify |
| `packages/dbgpt-serve/src/dbgpt_serve/conversation/models/models.py` | Modify |
| `packages/dbgpt-serve/src/dbgpt_serve/conversation/api/endpoints.py` | Modify |
| `packages/dbgpt-serve/src/dbgpt_serve/conversation/service/service.py` | Modify |
| `packages/dbgpt-core/src/dbgpt/core/interface/message.py` | Modify |
| `pages/reports/index.tsx` | Modify |

## Open Questions

1. **Pin persistence across pages**: Should the pinned items show in both "我的报告" and "所有任务" (conversations page)?
   - Currently only "我的报告" is in scope
   - Recommendation: Only "我的报告" for now

2. **Rename confirmation**: Should rename require confirmation, or just direct edit?
   - Recommendation: Direct inline edit (no modal)

3. **Summary length limit**: Should there be a max length for summary after rename?
   - Recommendation: Same as current 250 char limit from `latest_user_message.last_text[:250]`