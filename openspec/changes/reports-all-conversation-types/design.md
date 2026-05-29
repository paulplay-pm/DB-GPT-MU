## Context

**现状：**

- 报告页 (`reports/index.tsx`) 会话列表 API 调用传入 `{ chat_mode: 'chat_react_agent' }`，只返回普通会话
- 会话项点击后统一跳转到 `/?id=${convUid}&title=...`，`scene` 被硬编码为 `chat_react_agent`
- 应用会话（`chat_excel`、`chat_agent` 等）的详情页面路径不同：`/chat?scene=${chat_mode}&id=${convUid}`
- `/chat` 页面（`chat/index.tsx`）已支持多 `scene`，从 URL 参数读取 `scene` 和 `id`

**目标：** 报告页会话列表展示所有类型会话，点击后根据 `chat_mode` 路由到对应详情页。

## Goals / Non-Goals

**Goals:**
- 报告页会话列表显示所有类型的会话记录
- 根据 `chat_mode` 动态路由到正确页面

**Non-Goals:**
- 不修改 `/chat` 页面逻辑（已支持多 scene）
- 不修改后端 API（已支持无过滤条件查询）

## Decisions

### 决策 1：移除 `chat_mode` 过滤参数

**选择：** 删除 `getDialogueListPaged({ chat_mode: 'chat_react_agent' }, ...)` 中的 `chat_mode` 参数

**理由：** 后端 `query_page` 接口已支持不传 `chat_mode` 时返回所有类型会话。前端只需去掉过滤条件即可。

**备选：** 在后端添加 `all` 类型过滤 —— 不必要，后端已支持空查询。

### 决策 2：router.push 路由策略

**选择：** 所有类型统一跳转到 `/chat?scene=${chat_mode}&id=${convUid}`

**理由：**
- `index.tsx` 的 playground 对 `chat_react_agent` 没有特殊处理，`/chat` 页面同样能承载
- `/chat` 页面兼容 `chat_react_agent`（`scene` 从 URL 读取，`getHistory` 根据 `chatId` 加载历史）
- 统一路径避免维护两套逻辑

**备选 1：** 普通会话 → `/?id=...`，应用会话 → `/chat?scene=...&id=...`
- 缺点：两套路由，维护成本高，`index.tsx` 对 `chat_react_agent` 没有特殊价值

**备选 2：** 不修改路由，所有会话都跳 `/?id=...`
- 缺点：`index.tsx` 的 `scene` 硬编码为 `chat_react_agent`，应用会话无法正确加载

## Risks / Trade-offs

[Risk] `chat_react_agent` 会话跳转到 `/chat` 后行为差异
→ **Mitigation**: `/chat` 页面通过 `getChatHistory` 加载历史，和 `index.tsx` 的 `loadConversation` 行为一致，无功能差异

[Risk] 新路由 `/chat` 可能缺少某些 playground 特有组件（如 example cards）
→ **Mitigation**: 这是预期的 — 应用会话使用应用专属 UI，不需要 playground 的 example cards

## Migration Plan

1. 修改 `reports/index.tsx` — 移除 API 调用中的 `chat_mode` 过滤条件
2. 修改 `reports/index.tsx` — `router.push` 改为 `/chat?scene=${conv.chat_mode}&id=${conv.conv_uid}&title=${encodeURIComponent(getTitle(conv))}`
3. 验证：报告页 → 点击普通会话 → 正确加载历史
4. 验证：报告页 → 点击应用会话 → 正确加载历史并渲染对应组件

**Rollback**: 一行代码回滚即可恢复原逻辑。

## Open Questions

- 无
