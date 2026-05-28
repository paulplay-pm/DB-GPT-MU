# ChatBI 前端交互重构方案

> **Date**: 2026-05-27
> **Goal**: 基于原型风格重构 DB-GPT 前端交互

---

## 1. 需求概述

参考 `/Users/paulwang/project/TraeProject/chatbi-system-prototype.html` 原型文件，对 DB-GPT 前端进行交互重构。

### 重构原则
- 功能不变，后端不变
- 纯前端重构
- 分阶段实施

---

## 2. 页面现状对比

### 2.1 现有页面（需要样式重构）

| 原型页面 | 现有页面路径 | 状态 |
|---------|-------------|------|
| 对话 | `pages/index.tsx` | ✅ 存在 |
| 数据源管理 | `pages/construct/database.tsx` | ✅ 存在 |
| 知识库 | `pages/construct/knowledge/index.tsx` | ✅ 存在 |
| 技能管理 | `pages/construct/skills/index.tsx` | ✅ 存在 |
| 提示词管理 | `pages/construct/prompt/index.tsx` | ✅ 存在 |
| AWEL工作流 | `pages/construct/flow/` | ✅ 存在 |
| 应用管理 | `pages/construct/app/index.tsx` | ✅ 存在 |
| 模型评测 | `pages/models_evaluation/` | ✅ 存在 |
| DBGPTS社区 | `pages/construct/dbgpts/index.tsx` | ✅ 存在 |
| 审核用户 | `pages/admin/registration.tsx` | ✅ 存在 |
| 用户管理 | `pages/admin/user.tsx` | ✅ 存在 |
| 角色管理 | `pages/admin/role.tsx` | ✅ 存在 |
| 部门管理 | `pages/admin/dept.tsx` | ✅ 存在 |
| 权限管理 | `pages/admin/permission.tsx` | ✅ 存在 |

### 2.2 新增页面（需要全新开发）

| 页面 | 描述 | 开发方式 |
|-----|------|---------|
| 我的报告 | 报告管理和查看 | 仅前端静态 |
| 收藏夹 | 收藏的报表快捷入口 | 仅前端静态 |
| 模板广场 | 模板市场发现 | 仅前端静态 |
| 团队共享 | 查看团队分享的报表 | 仅前端静态 |

---

## 3. 导航栏结构（原型）

```
┌──────────────────────────────────────────────────────────────┐
│  📊 工作区                                                    │
│     ├── 对话（首页默认）                                      │
│     ├── 我的报告                                              │
│     └── 收藏                                                 │
│                                                              │
│  🔍 探索发现                                                  │
│     ├── 模板广场                                              │
│     └── 团队共享                                              │
│                                                              │
│  ⚙️ 配置中心                                                  │
│     ├── 数据源管理                                            │
│     └── 知识库                                                │
│                                                              │
│  🛠️ 开发者中心                                                │
│     ├── 技能管理                                              │
│     ├── 提示词管理                                             │
│     ├── AWEL工作流                                            │
│     ├── 应用管理                                              │
│     ├── 模型评测                                              │
│     └── DBGPTS社区                                           │
│                                                              │
│  🔐 系统管理                                                  │
│     ├── 审核用户                                              │
│     ├── 用户管理                                              │
│     ├── 角色管理                                              │
│     ├── 部门管理                                              │
│     └── 权限管理                                              │
└──────────────────────────────────────────────────────────────┘
```

### 3.1 导航交互规则（原型）
- 当前页面高亮：左侧显示蓝色竖线，文字和图标变为蓝色
- 分组展示：按使用场景分组，用分隔线区分
- 角标提示：审核用户显示待审核数量角标
- 用户菜单：点击头像弹出下拉菜单

---

## 4. 设计规范

### 4.1 色彩规范
```css
--primary: #1677ff      /* 主色-蓝 */
--primary-light: #e6f4ff
--primary-hover: #4096ff
--success: #52c41a      /* 成功-绿 */
--warning: #faad14      /* 警告-橙 */
--error: #ff4d4f        /* 错误-红 */
--purple: #722ed1
--cyan: #13c2c2
--text-primary: #1f2937
--text-secondary: #6b7280
--text-tertiary: #9ca3af
--bg-primary: #f8fafc
--bg-white: #ffffff
--border: #e5e7eb
```

### 4.2 字体规范
```css
page-title: 24px, 600 weight
body: 14px, 400 weight
helper text: 13px, 400 weight, gray
```

### 4.3 圆角规范
```css
card: 12px
button: 8px
input: 8px
tag: 20px (pill shape)
```

### 4.4 页面布局
```
┌─────────────────────────────────────────────────────────┐
│  Logo ChatBI           面包屑              用户头像      │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  侧边栏  │               主内容区                         │
│  导航   │                                              │
│          │                                              │
│ 用户卡片│                                              │
└──────────┴──────────────────────────────────────────────┘
```

---

## 5. 实施计划

### 阶段一：导航栏重构
1. 创建新的导航组件 `components/layout/NewSideBar.tsx`
2. 实现分组导航结构（工作区、探索发现、配置中心、开发者中心、系统管理）
3. 实现高亮状态（蓝色竖线）
4. 实现用户菜单（下拉菜单）
5. 替换现有 SideBar

### 阶段二：现有页面样式优化
1. 统一页面标题样式 (`page-title: 24px, 600`)
2. 统一工具栏样式（搜索框 + 筛选标签）
3. 统一卡片样式
4. 更新配色变量

### 阶段三：新增页面开发
1. `pages/reports/index.tsx` - 我的报告
2. `pages/favorites/index.tsx` - 收藏夹
3. `pages/templates/index.tsx` - 模板广场
4. `pages/team/index.tsx` - 团队共享

---

## 6. 文件变更清单

### 新增文件
```
pages/reports/index.tsx          # 我的报告
pages/favorites/index.tsx        # 收藏夹
pages/templates/index.tsx        # 模板广场
pages/team/index.tsx             # 团队共享
components/layout/NewSideBar.tsx # 新导航栏
new-components/layout/NewSider.tsx
```

### 修改文件
```
components/layout/side-bar.tsx   # 现有侧边栏（将被替换）
pages/index.tsx                 # 主页样式优化
pages/construct/database.tsx     # 数据源样式优化
pages/construct/knowledge/       # 知识库样式优化
pages/admin/registration.tsx     # 审核用户样式优化
pages/admin/user.tsx             # 用户管理样式优化
pages/admin/role.tsx             # 角色管理样式优化
pages/admin/dept.tsx             # 部门管理样式优化
pages/admin/permission.tsx       # 权限管理样式优化
```

---

## 7. 技术实现要点

### 7.1 导航高亮实现
```tsx
// 选中态：左侧蓝色竖线
.nav-item.active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--primary);
  border-radius: 0 3px 3px 0;
}
```

### 7.2 页面标题组件
```tsx
<div className="page-header">
  <h1 className="page-title">{title}</h1>
  <p className="page-desc">{description}</p>
</div>
```

### 7.3 工具栏组件
```tsx
<div className="toolbar">
  <div className="search-box">
    <SearchIcon />
    <input className="search-input" placeholder="搜索..." />
  </div>
  <div className="filter-tabs">
    <button className="filter-tab active">全部</button>
    <button className="filter-tab">待审核</button>
  </div>
</div>
```

---

## 8. 验证标准

1. 导航栏显示正确的分组结构
2. 当前页面正确高亮
3. 点击菜单能正确跳转到对应页面
4. 各页面样式与原型一致
5. 新增页面显示正确的静态内容
6. 构建无错误

---

## 9. 下一步

创建 implementation plan 任务清单？