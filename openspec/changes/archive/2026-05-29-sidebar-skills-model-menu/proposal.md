## Why

左侧导航栏"开发者中心"缺少"技能"和"模型管理"菜单入口。用户需要从导航栏直接访问技能管理页面和模型管理页面，而不是通过其他方式跳转。

## What Changes

在开发者中心导航组中添加两个菜单项：

1. **技能管理** (`skills`) — 链接到 `/construct/skills`
   - 图标: `ToolOutlined` (已使用)
   - 权限: `settings.skills`
   - 翻译: `skills` (已存在)

2. **模型管理** (`model_management`) — 链接到 `/construct/models`
   - 图标: 新增 `ModelOutlined` (需从 `@ant-design/icons` 导入)
   - 权限: `settings.model_manage`
   - 翻译: `model_manage` (已存在)

## Capabilities

| Capability | Change |
|------------|--------|
| `sidebar-skills-link` | 导航到技能管理页面 |
| `sidebar-model-mgmt-link` | 导航到模型管理页面 |

## Impact

**Files:**
- Modify: `web/components/layout/NewSideBar/config.ts` — 添加 NavItem

**测试范围:**
- 导航项显示正确
- 点击跳转正确页面
- 权限控制正常（无权限用户不显示）

## Non-goals

- 不修改页面功能逻辑
- 不添加新页面
- 不修改其他导航组