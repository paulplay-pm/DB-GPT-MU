## Context

**当前状态：**
- `/chat` 页面包含左侧 `ChatSider` 组件，用于展示会话列表（"平台小助手" + 所有对话记录）
- 用户已通过报告页（reports）统一管理所有对话记录（含应用对话和普通对话）
- 左侧列表在应用对话详情页显得冗余

**约束：**
- 不可影响现有应用对话功能（chat_normal、chat_excel、chat_agent、chat_knowledge、chat_dashboard）
- 从报告页进入历史应用对话必须正常工作
- 新建对话后列表刷新机制必须保留

## Goals / Non-Goals

**Goals:**
- 移除 `/chat` 页面的左侧会话列表（ChatSider）
- 保持所有应用对话类型正常工作
- 保持从报告页进入历史应用对话正常加载
- 保持新建对话后的列表刷新功能

**Non-Goals:**
- 不删除 ChatSider 组件文件（保留供将来可能使用）
- 不修改报告页的对话管理功能
- 不修改会话列表的 API 接口

## Decisions

**决策：直接移除 ChatSider 渲染**

原因：
- ChatSider 的导航功能已被报告页取代
- 会话切换完全通过 URL 参数（`?scene=X&id=Y`）工作，不依赖 ChatSider
- 新建对话后的 `refreshDialogList` 调用在 `ChatInputPanel` 中，不受 ChatSider 影响

替代方案考虑：
- 折叠而非删除 → 未采纳，用户已有报告页管理会话，无需在聊天页保留
- 条件隐藏 → 增加代码复杂度，无实际价值

## Risks / Trade-offs

[风险] 用户无法在聊天页快速切换其他会话
→ 缓解：用户可通过报告页或其他入口切换

[风险] 删除后影响某些未知依赖
→ 缓解：ChatSider 组件文件保留，如有问题可快速回滚

[风险] "平台小助手"入口消失
→ 缓解：用户可通过其他入口访问普通对话

## Migration Plan

1. 修改 `web/pages/chat/index.tsx`，移除 `<ChatSider />` 组件及关联状态
2. 验证各应用对话类型正常
3. 验证从报告页进入历史应用对话正常
4. 验证新建对话后列表刷新正常
5. 部署

**回滚方案：** 将 ChatSider 组件重新添加到 `web/pages/chat/index.tsx` 即可

## Open Questions

无

## 测试架构

**E2E 测试用例：**

| 用例 | 测试步骤 | 预期结果 |
|------|---------|---------|
| chat_normal 对话 | 进入对话 → 发送消息 | 正常对话 |
| chat_excel 对话 | 进入对话 → 发送消息 | 正常对话 |
| chat_agent 对话 | 进入对话 → 发送消息 | 正常对话 |
| chat_knowledge 对话 | 进入对话 → 发送消息 | 正常对话 |
| chat_dashboard 对话 | 进入对话 → 发送消息 | 正常对话 |
| 从报告页进入历史 | 在报告页点击历史应用对话 | 正常加载历史记录并继续对话 |
| 新建对话刷新 | 新建应用对话并发送消息 | 对话列表自动刷新 |

**CI 校验流程：**
- 前端构建检查：`npm run build` 无错误
- 类型检查：无新增 TypeScript 错误