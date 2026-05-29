# Session List Enhancement Specification

## Status

Proposed

## ADDED Requirements

### Requirement: Display session creation time
The system SHALL display the creation time (`gmt_created`) for each conversation in the session list, formatted as an absolute datetime string (e.g., "2024-01-07 09:00").

#### Scenario: Display creation time on My Reports page
- **WHEN** user navigates to "我的报告" > "会话记录" tab
- **THEN** each conversation item SHALL display "创建: {yyyy-mm-dd hh:mm}" derived from `gmt_created` field

#### Scenario: Creation time shown with relative update time
- **WHEN** user views a conversation item
- **THEN** system SHALL display both "更新: {relative time}" (from `gmt_modified`) and "创建: {absolute time}" (from `gmt_created`)

### Requirement: Display session update time with label
The system SHALL display the update time with a prefix label "更新: " for each conversation, showing relative time (e.g., "更新: 38 minutes ago").

#### Scenario: Update time displays with "更新:" prefix
- **WHEN** user views a conversation item
- **THEN** system SHALL display "更新: {relative time from gmt_modified}" instead of just the relative time

#### Scenario: Relative time calculation from gmt_modified
- **WHEN** system calculates relative time
- **THEN** it SHALL use `gmt_modified` field and moment.js `fromNow()` format

### Requirement: Pin conversation to top
The system SHALL allow users to pin conversations, and pinned conversations SHALL appear at the top of the session list, ordered by `is_pinned DESC`.

#### Scenario: Pin a conversation
- **WHEN** user hovers over a conversation item and clicks the pin icon
- **THEN** system SHALL call `POST /api/v1/serve/conversation/pin?conv_uid={uid}` to set `is_pinned=True`

#### Scenario: Unpin a conversation
- **WHEN** user hovers over a pinned conversation item and clicks the pin icon
- **THEN** system SHALL call `POST /api/v1/serve/conversation/unpin?conv_uid={uid}` to set `is_pinned=False`

#### Scenario: Pinned items appear first
- **WHEN** user views the session list
- **THEN** all pinned conversations SHALL appear before unpinned conversations, both groups ordered by `gmt_modified DESC`

#### Scenario: Pin state persists after page refresh
- **WHEN** user refreshes the page
- **THEN** pinned conversations SHALL remain pinned and appear at the top

### Requirement: Rename conversation summary
The system SHALL allow users to rename a conversation's summary via inline edit, and the renamed summary SHALL be persisted to the database.

#### Scenario: Enter rename mode
- **WHEN** user hovers over a conversation item and clicks the rename icon
- **THEN** system SHALL display an inline text input with the current summary value for editing

#### Scenario: Confirm rename
- **WHEN** user enters a new summary value and confirms
- **THEN** system SHALL call `POST /api/v1/serve/conversation/rename` with `conv_uid` and `new_summary`
- **AND** the session list SHALL display the new summary value

#### Scenario: Cancel rename
- **WHEN** user enters edit mode and clicks cancel or presses Escape
- **THEN** system SHALL discard the edited value and revert to display mode

#### Scenario: Rename persists after reload
- **WHEN** user renames a conversation and reloads the page
- **THEN** the new summary value SHALL be displayed

### Requirement: Summary locked to first user input
The system SHALL only set the `summary` field from the first user message, and SHALL NOT update `summary` on subsequent messages in the same conversation.

#### Scenario: First message sets summary
- **WHEN** user creates a new conversation and sends the first message
- **THEN** the `summary` field in `chat_history` SHALL be set to the user's first input (truncated to 250 characters)

#### Scenario: Subsequent messages do not update summary
- **WHEN** user sends additional messages in the same conversation
- **THEN** the `summary` field SHALL NOT be modified

#### Scenario: Manual rename overrides locked summary
- **WHEN** user renames a conversation's summary
- **THEN** the new summary value SHALL be persisted and SHALL NOT be overwritten by subsequent messages

### Requirement: Pin state in API response
The system SHALL include `is_pinned` field in the conversation list API response.

#### Scenario: Response includes is_pinned
- **WHEN** frontend calls `GET /api/v1/serve/conversation/query_page`
- **THEN** the response SHALL include `is_pinned: boolean` for each conversation item

### Requirement: Database schema for pin support
The database SHALL have an `is_pinned` column in the `chat_history` table to persist pin state.

#### Scenario: Add is_pinned column
- **WHEN** database upgrade script is executed
- **THEN** `ALTER TABLE chat_history ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT FALSE` SHALL be run
- **AND** an index `idx_chat_history_is_pinned` SHALL be created

---

## MODIFIED Requirements

### Requirement: Conversation list ordering
The conversation list query SHALL order results by `is_pinned DESC, gmt_modified DESC`.

**Previous Behavior:** Ordered by `gmt_created DESC`

**New Behavior:** Primary sort by `is_pinned DESC` (pinned first), secondary sort by `gmt_modified DESC` (most recently updated first)

#### Scenario: Order with pinned items first
- **WHEN** user requests conversation list with mixed pinned/unpinned items
- **THEN** all pinned items SHALL appear first, sorted by `gmt_modified DESC`
- **AND** all unpinned items SHALL appear after, sorted by `gmt_modified DESC`