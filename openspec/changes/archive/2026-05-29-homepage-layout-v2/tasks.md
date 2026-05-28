# 首页布局 V2 任务清单

## 1. 恢复状态变量

- [ ] 1.1 恢复 `isSkillPanelOpen` / `setIsSkillPanelOpen` 移除 underscore 前缀
- [ ] 1.2 恢复 `isKnowledgePanelOpen` / `setIsKnowledgePanelOpen` 移除 underscore 前缀
- [ ] 1.3 恢复 `isDbPanelOpen` / `setIsDbPanelOpen` 移除 underscore 前缀
- [ ] 1.4 恢复 `skillSearchQuery` / `setSkillSearchQuery` 移除 underscore 前缀

## 2. 恢复工具栏 Dropdown

- [ ] 2.1 在底部工具栏左侧恢复 Dropdown 组件
  - 包含: 上传文件 / 使用技能 / 使用知识库 / 使用数据源
- [ ] 2.2 恢复 Skill Popover 组件
  - 包含搜索输入框、技能列表、管理技能链接

## 3. 调整 Flex 布局

- [ ] 3.1 外层容器添加 `justify-between`
- [ ] 3.2 内层容器添加 `flex-1`

## 4. 验证

- [ ] 4.1 `yarn build` 构建成功
- [ ] 4.2 对话框固定在最底部
- [ ] 4.3 slogan 在空白区域中心
- [ ] 4.4 工具栏 Dropdown 功能正常