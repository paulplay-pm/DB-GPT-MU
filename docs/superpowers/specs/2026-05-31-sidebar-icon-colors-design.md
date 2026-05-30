# 左侧导航栏 Icon 彩色化设计方案

## Context

**当前状态:**
- 左侧导航栏 `NewSideBar` 的菜单 icon 使用灰色 (`text-[var(--text-secondary)]`)
- 选中状态使用深灰色 (`text-[var(--text-primary)]`) + 左侧蓝色指示条

**目标:**
- 为每个菜单 icon 配置独特的彩色，提升视觉层次和美观度
- 保持与 Ant Design 5 设计语言的一致性

## Goals / Non-Goals

**Goals:**
- 为 `NewSideBar` 中的每个菜单 icon 配置功能关联的彩色
- 保持选中/悬停状态的交互反馈

**Non-Goals:**
- 不修改 Ant Design icon 组件本身
- 不改变布局和间距
- 不修改其他页面的 icon 颜色

## Decisions

### 配色方案：按功能分组的彩虹配色

| 菜单组 | Icon Key | Icon 组件 | 颜色 | 色值 |
|-------|----------|----------|------|------|
| **工作区** | | | | |
| 聊天 | chat | MessageFilled | 🔵 品牌蓝 | `#1677FF` |
| 报告 | reports | FileTextFilled | 🟢 成功绿 | `#52C41A` |
| 收藏 | favorites | StarFilled | ⭐ 星级黄 | `#FAAD14` |
| **探索发现** | | | | |
| 模板 | templates | AppstoreFilled | 🟣 紫色 | `#722ED1` |
| 团队 | team | TeamOutlined | 🔷 青绿 | `#13C2C2` |
| **配置中心** | | | | |
| 数据源 | datasources | DatabaseFilled | 🟠 橙色 | `#FA8C16` |
| 知识库 | knowledge | BookFilled | 🟤 棕色 | `#8B4513` |
| **开发者中心** | | | | |
| 技能 | skills | ToolFilled | ⚙️ 灰蓝 | `#597EF7` |
| 提示词 | prompts | EditFilled | 🔴 红色 | `#F5222D` |
| 工作流 | awel_workflow | ApartmentOutlined | 🟣 紫蓝 | `#2F54EB` |
| 应用 | app_management | AppstoreOutlined | 🟣 紫色 | `#722ED1` |
| 模型 | model_management | DatabaseOutlined | 🟠 深橙 | `#D46B08` |
| 评测 | models_evaluation | LineChartOutlined | 🟢 青绿 | `#13C2C2` |
| DBGPTS | dbgpts | GlobalOutlined | 🔵 深蓝 | `#1890FF` |
| **系统管理** | | | | |
| 注册 | registration | UserAddOutlined | 🟢 绿色 | `#52C41A` |
| 用户 | user | UserOutlined | 🔵 蓝色 | `#1677FF` |
| 角色 | role | KeyOutlined | 🔑 金色 | `#D4A017` |
| 部门 | dept | ApartmentOutlined | 🟣 紫蓝 | `#2F54EB` |
| 权限 | permission | SafetyOutlined | ⚠️ 橙色 | `#FA8C16` |

### 实现方案

1. 创建 `ICON_COLOR_MAP` 常量映射 icon key 到颜色类名
2. 修改 `NavMenuItem` 组件，支持传入 icon 颜色
3. 保持现有选中/悬停逻辑不变

## Implementation

### 修改文件
- `web/components/layout/NewSideBar/index.tsx`

### 颜色类名对应
```typescript
const ICON_COLORS: Record<string, string> = {
  chat: 'text-[#1677FF]',
  reports: 'text-[#52C41A]',
  favorites: 'text-[#FAAD14]',
  templates: 'text-[#722ED1]',
  team: 'text-[#13C2C2]',
  datasources: 'text-[#FA8C16]',
  knowledge: 'text-[#8B4513]',
  skills: 'text-[#597EF7]',
  prompts: 'text-[#F5222D]',
  awel_workflow: 'text-[#2F54EB]',
  app_management: 'text-[#722ED1]',
  model_management: 'text-[#D46B08]',
  models_evaluation: 'text-[#13C2C2]',
  dbgpts: 'text-[#1890FF]',
  registration: 'text-[#52C41A]',
  user: 'text-[#1677FF]',
  role: 'text-[#D4A017]',
  dept: 'text-[#2F54EB]',
  permission: 'text-[#FA8C16]',
};
```

### 交互状态处理
- **默认状态**: 使用上述彩色
- **悬停状态**: 保持原 `group-hover:text-[var(--text-primary)]` 变亮
- **选中状态**: 保持 `text-[var(--text-primary)]` + 左侧蓝色指示条

## Risks / Trade-offs

**风险**: 部分用户可能偏好统一的单色风格
**缓解**: 彩色方案提供更好的视觉层次，功能分组更清晰

## Migration Plan

1. 修改 `web/components/layout/NewSideBar/index.tsx`
2. 添加 `ICON_COLORS` 常量
3. 修改 `NavMenuItem` 组件，传入 icon 颜色
4. 验证所有菜单 icon 颜色正确显示
5. 验证选中/悬停状态正常

## Open Questions

无