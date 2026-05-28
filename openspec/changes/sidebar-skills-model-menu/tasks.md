# 侧边栏技能与模型管理菜单任务清单

## 1. 确认现有配置

- [ ] 1.1 确认 `skills` 菜单项已存在于 `config.ts`
- [ ] 1.2 确认 `DatabaseOutlined` 已导入到 `config.ts`
- [ ] 1.3 确认 `MODEL_MANAGE` 权限 key 存在
- [ ] 1.4 确认 `/construct/models` 页面存在

## 2. 添加 model_management 菜单项

- [ ] 2.1 在 `config.ts` 的 `NAV_GROUPS[3].items` 添加 `model_management` 项
  ```ts
  {
    key: 'model_management',
    label: 'model_manage',
    icon: 'DatabaseOutlined',
    path: '/construct/models',
    permission: PERMISSION_KEYS.MODEL_MANAGE,
  }
  ```
- [ ] 2.2 规范校验: 确认 `DatabaseOutlined` 在 ICON_MAP 中
- [ ] 2.3 规范校验: 确认 `settings.model_manage` 权限存在

## 3. 验证

- [ ] 3.1 运行 `yarn lint` 无 ESLint 错误
- [ ] 3.2 运行 `yarn build` 构建成功
- [ ] 3.3 导航项显示正确
- [ ] 3.4 点击跳转正确页面

## 编码规范

- 翻译 key 使用 `model_manage`
- 图标使用 `DatabaseOutlined`
- 权限使用 `PERMISSION_KEYS.MODEL_MANAGE`