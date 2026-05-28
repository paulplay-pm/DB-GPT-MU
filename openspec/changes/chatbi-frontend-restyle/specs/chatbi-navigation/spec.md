# ChatBI Navigation Spec

## ADDED Requirements

### Requirement: 分组导航栏渲染
系统 SHALL 实现 ChatBI 风格的分组导航栏，包含5个分组：工作区、探索发现、配置中心、开发者中心、系统管理。

#### Scenario: 默认状态渲染
- **WHEN** 用户未登录或无权限
- **THEN** 导航栏显示工作区分组（对话入口）

#### Scenario: 完整导航渲染
- **WHEN** 超级管理员登录
- **THEN** 导航栏显示全部5个分组，共14个菜单项

#### Scenario: 普通用户权限过滤
- **WHEN** 普通用户登录且拥有部分权限
- **THEN** 导航栏仅显示该用户有权限访问的菜单项

### Requirement: 当前页面高亮
当前页面 SHALL 在导航中显示高亮状态，左侧显示蓝色竖线，文字和图标变为蓝色。

#### Scenario: 页面高亮正确显示
- **WHEN** 用户访问「用户管理」页面
- **THEN** 左侧导航「系统管理-用户管理」显示蓝色竖线，文字和图标变为蓝色

#### Scenario: 切换页面高亮更新
- **WHEN** 用户从「用户管理」切换到「角色管理」
- **THEN** 「用户管理」高亮取消，「角色管理」显示高亮

### Requirement: 用户菜单下拉
导航栏右上角 SHALL 显示用户头像，点击显示下拉菜单，包含个人信息、设置、退出登录。

#### Scenario: 用户菜单展开
- **WHEN** 用户点击头像
- **THEN** 显示下拉菜单，包含：用户名、角色、退出登录选项

#### Scenario: 退出登录
- **WHEN** 用户点击「退出登录」
- **THEN** 清除本地存储，跳转登录页

### Requirement: 审核用户角标
「系统管理-审核用户」菜单项 SHALL 显示待审核数量的角标。

#### Scenario: 显示待审核角标
- **WHEN** 存在待审核用户
- **THEN** 审核用户菜单显示红色角标，数字为待审核数量

#### Scenario: 无待审核时隐藏角标
- **WHEN** 无待审核用户
- **THEN** 审核用户菜单不显示角标

---

## 前端权限渲染校验

| 菜单项 | 所需权限 Key | 超级管理员 | 普通用户（无权限） |
|--------|-------------|-----------|------------------|
| 对话（首页） | 无 | 显示 | 显示 |
| 数据源管理 | `datasources` | 显示 | 根据权限 |
| 知识库 | `knowledge` | 显示 | 根据权限 |
| 技能管理 | `settings.skills` | 显示 | 根据权限 |
| 提示词管理 | `settings.prompts` | 显示 | 根据权限 |
| AWEL工作流 | `settings.awel_workflow` | 显示 | 根据权限 |
| 应用管理 | `settings.app_management` | 显示 | 根据权限 |
| 模型评测 | `settings.models_evaluation` | 显示 | 根据权限 |
| 用户管理 | `management.user_management` | 显示 | 根据权限 |
| 角色管理 | `management.role_management` | 显示 | 根据权限 |
| 部门管理 | `management.dept_management` | 显示 | 根据权限 |
| 权限管理 | `management.permission_management` | 显示 | 根据权限 |
| 审核用户 | `management.registration_review` | 显示 | 根据权限 |

---

## 页面交互用例

### Use Case: 导航菜单点击
1. 用户点击左侧导航菜单项
2. 系统跳转至对应页面
3. 目标页面导航项显示高亮

### Use Case: 分组折叠/展开
1. 用户点击分组标题
2. 该分组下的菜单列表折叠/展开
3. 其他分组保持当前状态

---

## 单元测试要求

- NewSideBar 组件渲染测试：验证5个分组都存在
- 权限过滤测试：验证无权限菜单项被正确过滤
- 高亮状态测试：验证当前页面高亮正确
- 用户菜单测试：验证下拉菜单选项完整