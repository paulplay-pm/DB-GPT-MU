# Sidebar Redesign Design

**Date:** 2026-05-28
**Status:** Approved

## Overview

重构左侧导航栏的 logo 区域和收起/展开交互，使其更美观，同时实现内容区域自动扩展铺满。

## Design Decisions

| Decision | Choice |
|----------|--------|
| Logo 风格 | 图标 + 名称 (B) - 左侧 logo 方块 + 右侧产品名，hover 时整体高亮 |
| 收缩按钮位置 | 固定在 logo 区域右侧 (A) - 按钮始终在 logo 右侧 |
| Tooltip 方案 | Ant Design Tooltip (A) - hover 时显示在图标下方 |

## Layout Structure

### 展开状态 (Expanded)
```
┌─────────────────────────────────────────────────────────┐
│ [DB Logo] DB-GPT                    [收起按钮] │  导航栏   │
├─────────────────────────────────────────────────────────┤
│  工作区                                           │         │
│    💬 对话                                        │  主内容  │
│    📊 报告                                        │   区域   │
│    ⭐ 收藏                                        │         │
│                                           │         │
│  配置中心                                     │         │
│    🗄️ 数据源                                  │         │
│    📚 知识库                                  │         │
├───────────────────────────────────────────────┤         │
│  [用户头像] UserName                           │         │
└─────────────────────────────────────────────────────────┘
```

### 收起状态 (Collapsed)
```
┌──┬──────────────────────────────────────────────────────┐
│  │                                                      │
│  │                                                      │
│  [DB] │                主内容区域自动扩展                 │
│  │                                                      │
│  💬 │                                                      │
│  📊 │                                                      │
│  ⭐ │                                                      │
│  │                                                      │
│  [收起按钮] │                                           │
│  [头像] │                                                │
└──┴──────────────────────────────────────────────────────┘
```

## Component Specifications

### Logo Area (展开状态)

| Element | Specification |
|---------|---------------|
| Logo 方块 | 32x32px, 渐变背景 `#31afff` → `#1677ff`, 圆角 8px |
| 产品名 | `DB-GPT`, font-weight 600, color: `var(--text-primary)` |
| Hover 效果 | 整体轻微高亮 (opacity 0.8) |

### Logo Area (收起状态)

| Element | Specification |
|---------|---------------|
| Logo 方块 | 32x32px, 居中显示 |
| 收缩按钮 | 位于底部，24x24 图标按钮 |

### Collapse Button

| Element | Specification |
|---------|---------------|
| 展开状态 | 显示"收起"文字 + 左箭头图标 |
| 收起状态 | 显示展开图标 |
| 位置 | Logo 区域右侧，始终可见，不随内容滚动 |
| Hover | 背景色变为 `var(--hover-bg)` |

### Nav Items (收起状态)

| Element | Specification |
|---------|---------------|
| 图标大小 | 20px |
| 间距 | 垂直排列，间距 8px |
| Tooltip | Ant Design Tooltip，hover 0.5s 延迟显示 |
| Tooltip 内容 | 中英文双语，如"对话 / Chat" |
| Active 状态 | 左侧蓝色竖条指示器 |

### Content Area

- 收起导航栏后，右侧内容区域自动扩展铺满
- 使用 CSS flex: 1 或 calc(100% - 64px) 实现
- 无需手动触发，React 状态更新自动重算

## Interaction Behaviors

| Behavior | Implementation |
|----------|---------------|
| 点击收起按钮 | 切换 `collapsed` 状态，动画 200ms |
| Hover 图标 (收起状态) | 显示 Ant Design Tooltip，内容为翻译键 |
| 点击导航项 | 路由跳转，高亮当前项 |
| 窗口宽度变化 | 导航栏保持固定宽度，内容区域自适应 |

## i18n Keys Required

| Key | 中文 | English |
|-----|------|---------|
| 收起 | 收起 | Collapse |
| 对话 / Chat | 对话 | Chat |
| 报告 / Reports | 报告 | Reports |
| 收藏 / Favorites | 收藏 | Favorites |
| 探索 / Explore | 探索 | Explore |
| 配置中心 / Config | 配置中心 | Configuration |
| 开发者中心 / Dev | 开发者中心 | Developer Center |
| 系统管理 / Admin | 系统管理 | System Admin |

## File Changes

| File | Change |
|------|--------|
| `web/components/layout/NewSideBar/index.tsx` | 重构 logo 区域、添加 tooltip、修复内容区域宽度 |
| `web/components/layout/NewSideBar/config.ts` | 无需更改 |
| `web/locales/zh/common.ts` | 添加收起按钮翻译键 |
| `web/locales/en/common.ts` | 添加收起按钮翻译键 |

## Tech Stack

- React functional component
- Ant Design Tooltip component
- CSS flexbox for layout
- CSS variables for theming
- react-i18next for translations

## Acceptance Criteria

1. ✅ Logo 区域使用"图标 + 名称"风格
2. ✅ 收缩按钮固定在 logo 区域右侧
3. ✅ 收起后右侧内容区域自动扩展
4. ✅ 收起状态下图标显示 Ant Design Tooltip
5. ✅ Tooltip 显示中英文双语
6. ✅ 展开/收起有平滑过渡动画
7. ✅ 按钮位置在顶部始终不变