## Why

应用对话详情页左侧的对话列表（ChatSider）主要用于展示当前用户的会话列表，包含"平台小助手"入口和所有对话记录。但用户已有独立的报告页面（reports）管理全部对话记录（含应用对话和普通对话），左侧列表显得冗余，且占用屏幕空间。删除此列表可简化界面，同时不影响核心聊天功能（chat_normal、chat_excel、chat_agent、chat_knowledge、chat_dashboard 等均可通过 URL 参数正常工作）。

## What Changes

- **移除 ChatSider 组件**：从 `/chat` 页面中删除 `ChatSider` 组件的渲染
- **保留核心功能**：
  - 新建对话后仍通过 `refreshDialogList` 更新会话列表（ChatInputPanel 调用）
  - 从报告页、历史记录进入应用对话通过 URL 参数（`?scene=X&id=Y`）正常加载
  - 所有应用对话类型的聊天功能保持不变
- **BREAKING**：
  - 聊天详情页左侧不再显示会话列表
  - 用户无法在聊天页左侧快速切换其他会话（需通过报告页或其他入口）

## Capabilities

### New Capabilities
- 无新增功能

### Modified Capabilities
- 无规格变更，仅删除冗余 UI 组件

## Impact

**受影响代码：**
- `web/pages/chat/index.tsx` — 移除 `<ChatSider />` 组件引用和传参
- `web/new-components/chat/sider/ChatSider.tsx` — 可保留组件文件（未被其他地方引用）

**不受影响功能：**
- chat_normal、chat_excel、chat_agent、chat_knowledge、chat_dashboard 等所有应用对话
- 从报告页进入历史应用对话
- 新建对话流程
- 对话历史加载（getChatHistory）
- 对话删除/分享（在报告页进行）

**测试范围：**
- 单元测试：无（纯 UI 组件移除）
- 接口测试：无
- E2E 测试：
  - 验证各应用对话类型（chat_normal、chat_excel、chat_agent、chat_knowledge、chat_dashboard）正常对话
  - 验证从报告页进入历史应用对话正常加载
  - 验证新建对话后列表刷新正常