# 左侧导航栏 Icon 彩色化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `NewSideBar` 左侧导航栏的每个菜单 icon 配置独特的彩色，提升视觉层次和美观度

**Architecture:** 通过在 `NewSideBar` 组件中添加 `ICON_COLORS` 常量映射，为每个菜单项配置对应的 Tailwind 颜色类名，修改 `NavMenuItem` 组件以支持彩色 icon 显示

**Tech Stack:** React + TypeScript + Tailwind CSS + Ant Design Icons

---

## 修改文件
- `web/components/layout/NewSideBar/index.tsx` — 唯一的修改文件

---

## Task 1: 添加 ICON_COLORS 常量

**Files:**
- Modify: `web/components/layout/NewSideBar/index.tsx:32-51` (ICON_MAP 之后添加)

- [ ] **Step 1: 在 ICON_MAP 后添加 ICON_COLORS 常量**

在 `web/components/layout/NewSideBar/index.tsx` 文件中，找到 `ICON_MAP` 常量（约第32行），在其后添加：

```typescript
// Icon color mapping - maps icon keys to Tailwind color classes
const ICON_COLORS: Record<string, string> = {
  chat: 'text-[#1677FF]',           // 🔵 品牌蓝 - 对话/沟通
  reports: 'text-[#52C41A]',        // 🟢 成功绿 - 文档/报告
  favorites: 'text-[#FAAD14]',      // ⭐ 星级黄 - 收藏/重要
  templates: 'text-[#722ED1]',       // 🟣 紫色 - 应用/模板
  team: 'text-[#13C2C2]',            // 🔷 青绿 - 团队协作
  datasources: 'text-[#FA8C16]',    // 🟠 橙色 - 数据库
  knowledge: 'text-[#8B4513]',        // 🟤 棕色 - 知识/书籍
  skills: 'text-[#597EF7]',          // ⚙️ 灰蓝 - 工具/技能
  prompts: 'text-[#F5222D]',          // 🔴 红色 - 编辑/创作
  awel_workflow: 'text-[#2F54EB]',   // 🟣 紫蓝 - 流程/架构
  app_management: 'text-[#722ED1]',  // 🟣 紫色 - 应用市场
  model_management: 'text-[#D46B08]', // 🟠 深橙 - AI 模型
  models_evaluation: 'text-[#13C2C2]', // 🟢 青绿 - 图表/评测
  dbgpts: 'text-[#1890FF]',          // 🔵 深蓝 - 全球/社区
  registration: 'text-[#52C41A]',    // 🟢 绿色 - 添加用户
  user: 'text-[#1677FF]',            // 🔵 蓝色 - 用户管理
  role: 'text-[#D4A017]',            // 🔑 金色 - 密钥/权限
  dept: 'text-[#2F54EB]',            // 🟣 紫蓝 - 组织架构
  permission: 'text-[#FA8C16]',      // ⚠️ 橙色 - 安全/权限
};
```

---

## Task 2: 修改 NavMenuItem 组件支持彩色 Icon

**Files:**
- Modify: `web/components/layout/NewSideBar/index.tsx:53-118` (NavMenuItem 函数组件)

- [ ] **Step 1: 修改 NavMenuItem 组件参数，添加 iconColor 属性**

将 `NavMenuItem` 组件的 props 修改为：

```typescript
function NavMenuItem({
  item,
  isActive,
  badgeCount,
  onNavigate,
  t,
  iconColor,
}: {
  item: NavItem;
  isActive: boolean;
  badgeCount?: number;
  onNavigate: (path: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  iconColor?: string;  // 新增：icon 颜色类名
}) {
```

- [ ] **Step 2: 修改 NavMenuItem 中 icon 的样式，应用彩色**

找到 NavMenuItem 中渲染 icon 的 `<span>` 元素（约第84-93行），将：

```typescript
<span
  className={cls(
    'text-lg mr-3 transition-colors duration-200',
    isActive
      ? 'text-[var(--text-primary)]'
      : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]',
  )}
>
  {icon}
</span>
```

修改为：

```typescript
<span
  className={cls(
    'text-lg mr-3 transition-colors duration-200',
    isActive
      ? 'text-[var(--text-primary)]'
      : iconColor || 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]',
  )}
>
  {icon}
</span>
```

---

## Task 3: 修改 renderNavGroups 函数传入 iconColor

**Files:**
- Modify: `web/components/layout/NewSideBar/index.tsx:218-227` (renderNavGroups 中调用 NavMenuItem)

- [ ] **Step 1: 修改 NavMenuItem 调用，传入 iconColor**

将：

```typescript
{visibleItems.map(item => (
  <NavMenuItem
    key={item.key}
    item={item}
    isActive={isItemActive(item.path)}
    badgeCount={item.key === 'registration' ? pendingCount : undefined}
    onNavigate={handleNavigate}
    t={t}
  />
))}
```

修改为：

```typescript
{visibleItems.map(item => (
  <NavMenuItem
    key={item.key}
    item={item}
    isActive={isItemActive(item.path)}
    badgeCount={item.key === 'registration' ? pendingCount : undefined}
    onNavigate={handleNavigate}
    t={t}
    iconColor={ICON_COLORS[item.key]}
  />
))}
```

---

## Task 4: 修改折叠状态下的 Icon 颜色

**Files:**
- Modify: `web/components/layout/NewSideBar/index.tsx:262-289` (collapsed state 下的 icon 渲染)

- [ ] **Step 1: 修改 collapsed 状态下 icon 的颜色**

找到 collapsed 状态渲染 icon 的 `<span>` 元素（约第282-289行），将：

```typescript
<span
  className={cls(
    'text-xl transition-colors duration-200',
    isActive ? 'text-primary' : 'text-[var(--text-secondary)]',
  )}
>
  {icon}
</span>
```

修改为：

```typescript
<span
  className={cls(
    'text-xl transition-colors duration-200',
    isActive ? 'text-primary' : (ICON_COLORS[item.key] || 'text-[var(--text-secondary)]'),
  )}
>
  {icon}
</span>
```

---

## Task 5: 验证构建

- [ ] **Step 1: 运行 TypeScript 类型检查**

```bash
cd web && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 2: 运行构建验证**

```bash
cd web && npm run build 2>&1 | tail -10
```

---

## 验证清单

- [ ] 所有菜单 icon 显示正确的彩色
- [ ] 悬停时 icon 颜色正确过渡
- [ ] 选中状态 icon 保持正确颜色（配合蓝色指示条）
- [ ] 折叠状态下 icon 颜色正常显示
- [ ] 构建无错误