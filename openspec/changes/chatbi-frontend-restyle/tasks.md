# ChatBI 前端重构任务清单

## 1. 导航栏重构

- [ ] 1.1 创建 `components/layout/NewSideBar.tsx` 组件骨架
- [ ] 1.2 实现5分组导航数据结构（工作区、探索发现、配置中心、开发者中心、系统管理）
- [ ] 1.3 集成 `hasPermission()` 实现菜单项权限过滤
- [ ] 1.4 实现当前页面高亮（蓝色竖线 + 文字图标变蓝）
- [ ] 1.5 创建用户菜单下拉组件（头像 + 下拉列表）
- [ ] 1.6 实现审核用户角标显示逻辑
- [ ] 1.7 编写 NewSideBar 组件单元测试（覆盖率 ≥80%）
- [ ] 1.8 规范校验清单：组件命名、Props类型、权限key映射
- [ ] 1.9 安全校验清单：XSS过滤、权限校验逻辑

## 2. 样式规范统一

- [ ] 2.1 创建 `styles/chatbi-variables.css` 定义 CSS 变量（色彩、字体、圆角）
- [ ] 2.2 创建 `components/common/PageHeader.tsx` 页面标题组件
- [ ] 2.3 创建 `components/common/Toolbar.tsx` 工具栏组件（搜索框 + 筛选标签）
- [ ] 2.4 编写 PageHeader 组件单元测试
- [ ] 2.5 编写 Toolbar 组件单元测试

## 3. 现有页面样式优化

- [ ] 3.1 更新 `pages/admin/user.tsx` 页面样式（标题 + 工具栏 + 卡片）
- [ ] 3.2 更新 `pages/admin/role.tsx` 页面样式
- [ ] 3.3 更新 `pages/admin/dept.tsx` 页面样式
- [ ] 3.4 更新 `pages/admin/permission.tsx` 页面样式
- [ ] 3.5 更新 `pages/admin/registration.tsx` 页面样式
- [ ] 3.6 更新 `pages/index.tsx`（首页/对话）页面样式
- [ ] 3.7 更新 `pages/construct/database.tsx`（数据源）页面样式
- [ ] 3.8 编写管理页面样式回归测试

## 4. 新增页面开发

- [ ] 4.1 创建 `pages/reports/index.tsx` - 我的报告页面
- [ ] 4.2 创建 `pages/favorites/index.tsx` - 收藏夹页面
- [ ] 4.3 创建 `pages/templates/index.tsx` - 模板广场页面
- [ ] 4.4 创建 `pages/team/index.tsx` - 团队共享页面
- [ ] 4.5 编写新页面单元测试（渲染、空状态、搜索）
- [ ] 4.6 规范校验清单：路由命名、组件结构、i18n key

## 5. 集成与验收

- [ ] 5.1 在布局中引入 NewSideBar 替换现有侧边栏
- [ ] 5.2 配置 Ant Design ConfigProvider 主题变量
- [ ] 5.3 集成测试：完整登录->导航->页面访问流程
- [ ] 5.4 E2E 测试：验证所有导航链接可访问
- [ ] 5.5 安全检查：权限控制是否正常工作
- [ ] 5.6 构建验证：`npm run build` 无错误

---

## 任务依赖关系

```
1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7
                              ↓
                           1.8, 1.9
                              ↓
2.1 → 2.2 → 2.3 → 2.4 → 2.5
              ↓
3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 → 3.7 → 3.8
              ↓
4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6
              ↓
5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6
```

## 编码规范

- React 组件使用 TypeScript 严格模式
- 组件文件使用 PascalCase（如 `NewSideBar.tsx`）
- Hooks 使用 camelCase 以 `use` 开头
- CSS 类名使用 kebab-case
- 所有用户可见文本使用 `t()` i18n key