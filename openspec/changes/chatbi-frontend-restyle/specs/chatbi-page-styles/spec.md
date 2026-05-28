# ChatBI Page Styles Spec

## ADDED Requirements

### Requirement: 页面标题样式统一
所有管理页面 SHALL 使用统一页面标题样式：字号24px，字重600。

#### Scenario: 页面标题渲染
- **WHEN** 访问用户管理页面
- **THEN** 页面标题「用户管理」显示为24px/600

#### Scenario: 标题下方描述
- **WHEN** 页面有描述文本
- **THEN** 描述文本显示为13px/400，颜色为 gray

### Requirement: 工具栏样式统一
页面工具栏 SHALL 包含搜索框和筛选标签，统一样式。

#### Scenario: 工具栏搜索框
- **WHEN** 页面需要搜索功能
- **THEN** 显示圆角输入框（8px），左侧搜索图标

#### Scenario: 筛选标签栏
- **WHEN** 页面需要状态筛选
- **THEN** 显示标签组，如「全部」「待审核」

### Requirement: 卡片样式统一
页面内的卡片 SHALL 使用统一圆角（12px）和阴影。

#### Scenario: 卡片渲染
- **WHEN** 页面包含卡片组件
- **THEN** 卡片圆角为12px，带轻微阴影

### Requirement: 按钮样式统一
操作按钮 SHALL 使用统一样式：主按钮蓝色（#1677ff），圆角8px。

#### Scenario: 新增按钮
- **WHEN** 页面显示新增操作按钮
- **THEN** 按钮为蓝色主按钮，文字白色

#### Scenario: 表格操作按钮
- **WHEN** 表格行显示编辑/删除按钮
- **THEN** 编辑为文本按钮，删除为红色文本按钮

### Requirement: 色彩规范执行
页面 SHALL 使用 ChatBI 设计规范的色彩系统。

#### Scenario: 主色调应用
- **WHEN** 需要强调色
- **THEN** 使用 #1677ff（蓝色）

#### Scenario: 状态颜色
- **WHEN** 显示成功/警告/错误状态
- **THEN** 使用 #52c41a（绿）/#faad14（橙）/#ff4d4f（红）

#### Scenario: 文字层次
- **WHEN** 显示不同层级文字
- **THEN** 主文字 #1f2937，次要文字 #6b7280，辅助文字 #9ca3af

---

## 页面样式检查清单

| 页面 | 标题样式 | 工具栏 | 卡片 | 按钮 |
|------|---------|-------|------|------|
| pages/admin/user.tsx | ✅ 24px/600 | ✅ 搜索+筛选 | ✅ 12px圆角 | ✅ 蓝色主按钮 |
| pages/admin/role.tsx | ✅ 24px/600 | ✅ 搜索+筛选 | ✅ 12px圆角 | ✅ 蓝色主按钮 |
| pages/admin/dept.tsx | ✅ 24px/600 | N/A | ✅ 树形卡片 | ✅ 蓝色主按钮 |
| pages/admin/permission.tsx | ✅ 24px/600 | ✅ 搜索 | ✅ 树形卡片 | ✅ 蓝色主按钮 |
| pages/admin/registration.tsx | ✅ 24px/600 | ✅ 搜索+筛选 | ✅ 12px圆角 | ✅ 蓝色主按钮 |

---

## 单元测试要求

- 页面标题组件测试：验证样式正确
- 工具栏组件测试：验证搜索和筛选功能
- 色彩变量测试：验证 CSS 变量值正确