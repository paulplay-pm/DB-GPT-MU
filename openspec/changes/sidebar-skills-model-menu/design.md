# 侧边栏技能与模型管理菜单

## 概述

在 `web/components/layout/NewSideBar/config.ts` 中，为"开发者中心"导航组添加技能管理和模型管理菜单项。

## 导航配置修改

### 当前状态

**开发者中心 (developer_center) 组:**
```ts
{
  title: 'developer_center',
  items: [
    { key: 'skills', label: 'skills', icon: 'ToolOutlined', path: '/construct/skills', permission: PERMISSION_KEYS.SKILLS },
    { key: 'prompts', label: 'prompts', icon: 'EditOutlined', path: '/construct/prompt', permission: PERMISSION_KEYS.PROMPTS },
    { key: 'awel_workflow', label: 'awel_workflow', icon: 'ApartmentOutlined', path: '/construct/flow', permission: PERMISSION_KEYS.AWEL_WORKFLOW },
    { key: 'app_management', label: 'app_management', icon: 'AppstoreOutlined', path: '/construct/app', permission: PERMISSION_KEYS.APP_MANAGEMENT },
    { key: 'models_evaluation', label: 'models_evaluation', icon: 'LineChartOutlined', path: '/models_evaluation', permission: PERMISSION_KEYS.MODELS_EVALUATION },
    { key: 'dbgpts', label: 'dbgpts_community', icon: 'GlobalOutlined', path: '/construct/dbgpts', permission: PERMISSION_KEYS.DBGPTS_COMMUNITY },
  ],
}
```

### 目标状态

在 `skills` 之后添加 `model_management`：

```ts
{
  title: 'developer_center',
  items: [
    { key: 'skills', label: 'skills', icon: 'ToolOutlined', path: '/construct/skills', permission: PERMISSION_KEYS.SKILLS },
    { key: 'model_management', label: 'model_manage', icon: 'DatabaseOutlined', path: '/construct/models', permission: PERMISSION_KEYS.MODEL_MANAGE },
    { key: 'prompts', label: 'prompts', icon: 'EditOutlined', path: '/construct/prompt', permission: PERMISSION_KEYS.PROMPTS },
    // ... rest unchanged
  ],
}
```

**说明:**
- `skills` 已存在，无需添加
- `model_management` 使用 `DatabaseOutlined` 图标（已导入）或 `CloudServerOutlined`
- 路由 `/construct/models` 已存在
- 翻译 key `model_manage` 已存在

## 图标方案

从 `@ant-design/icons` 导入 `DatabaseOutlined` 或 `CloudServerOutlined`。当前 `config.ts` 已导入:

```ts
DatabaseOutlined,
```

使用 `DatabaseOutlined` 作为模型管理图标。

## 权限

使用现有 `PERMISSION_KEYS.MODEL_MANAGE: 'settings.model_manage'`。

## 编码规范

- 遵循现有 `NAV_GROUPS` 结构
- 翻译 key 使用 `model_manage` (已存在于 i18n)
- 图标从 Ant Design icons 库选择