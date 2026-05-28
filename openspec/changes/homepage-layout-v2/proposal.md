## Why

当前首页欢迎模式布局存在问题：
1. 对话框工具栏过于简化 — Task 5 删除了完整的上传/技能/知识库/数据源选择器
2. 对话框不在页面最底部 — 内容垂直居中，下半部分大量空白
3. slogan 不在空白区域中心

## What Changes

### 1. 恢复对话框工具栏

恢复被 Task 5 删除的完整工具入口：
- **Dropdown 按钮**: 上传文件 / 使用技能 / 使用知识库 / 使用数据源
- **Skill Popover**: 技能选择器（带搜索和列表）
- 保留简化的发送按钮样式（紫色方形）

### 2. 固定对话框在最底部

修改 Welcome Mode 外层容器 flex 属性：
- 添加 `justify-between` 让内容分布到顶部和底部
- slogan + cards 部分添加 `flex-1` 占据中间空间，slogan 自动在剩余空间居中
- 对话框自然固定在底部

### 3. 布局结构

```
┌─────────────────────────────────────┐
│     开口问数，看见洞察              │  ← slogan 在上半部分空白区域中心
│                                     │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐      │  ← cards
│   ┌────────────────────────┐       │
│   │      Input Box          │       │  ← input box 固定在最底部
│   └────────────────────────┘       │
└─────────────────────────────────────┘
```

## Capabilities

| Capability | Change |
|------------|--------|
| `homepage-toolbar` | 恢复完整工具栏 Dropdown + Skill Popover |
| `homepage-layout` | 对话框固定底部，slogan 在空白区域中心 |

## Impact

**Files:**
- Modify: `web/pages/index.tsx` — 恢复工具栏组件，调整 flex 布局

## Non-goals

- 不修改卡片样式（上一次 redesign 已完成）
- 不修改聊天模式布局
- 不修改底部 footer