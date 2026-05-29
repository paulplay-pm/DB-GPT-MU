## Why

当前"我的报告"页面的会话记录只显示 `chat_react_agent` 类型，隐藏了应用会话（chat_excel、chat_agent 等）。用户希望在同一列表中查看所有类型的会话，并且点击后能跳转到正确的详情页面（普通任务用普通对话页，应用任务用应用对话页）。

## What Changes

- **移除会话类型过滤**：会话列表 API 调用不再传递 `chat_mode` 过滤条件，返回所有类型的会话
- **新增智能路由**：点击会话时，根据 `chat_mode` 字段动态跳转到对应的详情页
  - `chat_react_agent` → `/chat?scene=chat_react_agent&id=${conv_uid}`
  - 其他应用类型（`chat_excel` 等）→ `/chat?scene=${chat_mode}&id=${conv_uid}`
- **数据面扩展**：`chat_history` 表中 `gmt_created` 字段需要返回到前端列表展示（字段已在数据库中，后端已支持，前端需渲染）

## Capabilities

### New Capabilities

- `reports-conversation-list`: 报告页会话列表增强
  - 支持展示所有会话类型（不过滤 `chat_mode`）
  - 支持按 `is_pinned` 排序（置顶优先），再按 `gmt_modified` 排序（最新优先）
  - 新增 `gmt_created` 字段展示（创建时间）
  - 列表项操作：置顶/取消置顶、重命名、删除（已有）

### Modified Capabilities

- 无现有 spec 需要修改（specs 目录为空）

## Impact

| 范围 | 影响 |
|------|------|
| 前端 | `web/pages/reports/index.tsx` — 移除 `chat_mode` 过滤参数，修改 router.push 逻辑，添加创建时间列 |
| 前端 | `web/pages/chat/index.tsx` — 已有 `/chat?scene=&id=` 路由支持多 scene，**无需修改** |
| 后端 | 已有 `query_page` API 支持无 `chat_mode` 过滤，**无需修改** |
| 测试 | 需验证：① 所有类型会话均显示 ② 各类型点击后跳转到正确页面 ③ 排序和操作功能正常 |

### 测试范围

- **单元测试**：前端组件 `useMemo` 排序逻辑
- **接口测试**：后端 `query_page` API 不传 `chat_mode` 时返回所有类型
- **E2E 测试**：从报告页会话列表 → 点击普通会话 → 验证进入普通对话页；从报告页 → 点击应用会话 → 验证进入应用对话详情页

### 安全检查项

- 用户只能查看/操作自己的会话（由后端 `user_name` / `user_id` 控制）
- `conv_uid` 作为查询参数经过后端验证

### 验收用例

1. 报告页会话列表同时显示普通会话和应用会话
2. 点击普通会话（`chat_react_agent`）正确跳转到 `/chat?scene=chat_react_agent&id=${conv_uid}`
3. 点击应用会话（`chat_excel`）正确跳转到 `/chat?scene=chat_excel&id=${conv_uid}`
4. 列表按置顶优先、修改时间倒序排列
5. 列表项显示创建时间（gmt_created）字段
6. 置顶、重命名、删除功能正常工作
