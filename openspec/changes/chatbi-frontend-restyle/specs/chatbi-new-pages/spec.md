# ChatBI New Pages Spec

## ADDED Requirements

### Requirement: 我的报告页面
系统 SHALL 提供「我的报告」页面，用于管理和查看用户创建的报告。

#### Scenario: 页面访问
- **WHEN** 用户访问 /reports
- **THEN** 显示「我的报告」页面标题

#### Scenario: 报告列表渲染
- **WHEN** 页面加载
- **THEN** 显示报告卡片列表，包含：报告名称、创建时间、状态标签

#### Scenario: 空状态
- **WHEN** 用户没有报告
- **THEN** 显示空状态插图和「暂无报告」文案

#### Scenario: 搜索功能
- **WHEN** 用户在搜索框输入关键词
- **THEN** 实时过滤报告列表

### Requirement: 收藏夹页面
系统 SHALL 提供「收藏夹」页面，用于快捷访问收藏的报表。

#### Scenario: 页面访问
- **WHEN** 用户访问 /favorites
- **THEN** 显示「收藏夹」页面标题

#### Scenario: 收藏列表渲染
- **WHEN** 页面加载
- **THEN** 显示收藏的报表卡片列表

#### Scenario: 空状态
- **WHEN** 用户没有收藏
- **THEN** 显示空状态插图和「暂无收藏」文案

### Requirement: 模板广场页面
系统 SHALL 提供「模板广场」页面，用于发现和浏览可用模板。

#### Scenario: 页面访问
- **WHEN** 用户访问 /templates
- **THEN** 显示「模板广场」页面标题

#### Scenario: 模板列表渲染
- **WHEN** 页面加载
- **THEN** 显示模板卡片网格，包含：模板名称、描述、缩略图

#### Scenario: 分类筛选
- **WHEN** 用户点击分类标签
- **THEN** 筛选显示该分类下的模板

### Requirement: 团队共享页面
系统 SHALL 提供「团队共享」页面，用于查看团队成员分享的报表。

#### Scenario: 页面访问
- **WHEN** 用户访问 /team
- **THEN** 显示「团队共享」页面标题

#### Scenario: 共享列表渲染
- **WHEN** 页面加载
- **THEN** 显示团队共享的报表列表，包含：报表名称、分享人、分享时间

#### Scenario: 筛选功能
- **WHEN** 用户选择筛选条件
- **THEN** 筛选显示符合条件的共享报表

---

## 页面路由

| 页面 | 路由 | 权限 | 说明 |
|------|------|------|------|
| 我的报告 | /reports | 登录用户 | 前端静态页面 |
| 收藏夹 | /favorites | 登录用户 | 前端静态页面 |
| 模板广场 | /templates | 登录用户 | 前端静态页面 |
| 团队共享 | /team | 登录用户 | 前端静态页面 |

---

## 组件结构

```
pages/reports/index.tsx
├── PageHeader (标题 + 描述)
├── Toolbar (搜索框 + 筛选标签)
├── ReportCard (报告卡片)
│   ├── 报告名称
│   ├── 创建时间
│   └── 状态标签
└── EmptyState (空状态)

pages/favorites/index.tsx
├── PageHeader
├── Toolbar (搜索框)
├── FavoriteCard (收藏卡片)
└── EmptyState

pages/templates/index.tsx
├── PageHeader
├── CategoryTabs (分类标签)
├── TemplateCard (模板卡片)
│   ├── 模板名称
│   ├── 描述
│   └── 缩略图
└── EmptyState

pages/team/index.tsx
├── PageHeader
├── Toolbar (搜索框 + 筛选)
├── SharedCard (共享卡片)
│   ├── 报表名称
│   ├── 分享人
│   └── 分享时间
└── EmptyState
```

---

## 单元测试要求

- 页面渲染测试：验证标题和结构正确
- 空状态测试：验证无数据时显示正确
- 搜索功能测试：验证关键词过滤
- 分类筛选测试：验证标签切换