## Why

当前 DB-GPT 前端交互与 ChatBI 原型风格差异较大，导航结构、页面布局、色彩规范和组件样式需要统一重构以提升用户体验。前端交互停留在旧版风格，与产品愿景不符，需要基于原型进行纯前端重构，保持功能不变、后端不变。

## What Changes

### 阶段一：导航栏重构
- 创建新导航组件 `NewSideBar.tsx`，实现5分组结构（工作区、探索发现、配置中心、开发者中心、系统管理）
- 当前页面高亮：左侧显示蓝色竖线，文字和图标变为蓝色
- 实现用户菜单下拉组件
- 替换现有 SideBar 组件

### 阶段二：现有页面样式优化
- 统一页面标题样式（page-title: 24px, 600 weight）
- 统一工具栏样式（搜索框 + 筛选标签）
- 统一卡片样式（card border-radius: 12px）
- 更新配色 CSS 变量（--primary: #1677ff 等）

### 阶段三：新增页面开发
- `pages/reports/index.tsx` - 我的报告
- `pages/favorites/index.tsx` - 收藏夹
- `pages/templates/index.tsx` - 模板广场
- `pages/team/index.tsx` - 团队共享

## Capabilities

### New Capabilities
- `chatbi-navigation`: 实现 ChatBI 风格导航栏组件，支持5分组结构和高亮状态
- `chatbi-page-styles`: 统一现有管理页面的样式规范
- `chatbi-new-pages`: 新增4个前端静态页面（我的报告、收藏夹、模板广场、团队共享）

### Modified Capabilities
<!-- 现有功能需求不变，仅前端样式调整 -->

## Impact

**前端文件变更：**
- 新增：`components/layout/NewSideBar.tsx`, `new-components/layout/NewSider.tsx`
- 新增：`pages/reports/index.tsx`, `pages/favorites/index.tsx`, `pages/templates/index.tsx`, `pages/team/index.tsx`
- 修改：`components/layout/side-bar.tsx`, `pages/index.tsx`, `pages/admin/` 下各页面
- i18n：`locales/zh/common.ts`, `locales/en/common.ts`

**测试范围：**
- 单元测试：NewSideBar 组件渲染、权限菜单过滤
- 集成测试：导航跳转、页面高亮状态、用户菜单交互
- E2E 测试：完整登录->导航->页面访问流程

**安全检查项：**
- 权限控制不受影响（仅视觉调整）
- 无新增 API 调用
- 无敏感信息泄露