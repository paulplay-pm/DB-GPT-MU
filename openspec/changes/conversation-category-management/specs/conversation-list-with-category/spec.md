# Conversation List with Category - Specification

## ADDED Requirements

### Requirement: 会话列表工具栏
会话列表顶部 SHALL 显示搜索框和批量管理按钮。

#### Scenario: 搜索框
- **WHEN** 用户在搜索框输入关键词
- **THEN** 系统 SHALL 实时过滤会话列表（按标题和内容摘要匹配），无需按回车
- **AND** 搜索结果与当前分类筛选联动

#### Scenario: 批量管理按钮
- **WHEN** 用户点击"批量管理"按钮
- **THEN** 系统 SHALL 进入批量管理模式，每个会话卡片左侧出现复选框
- **AND** 按钮变为紫色边框激活状态

### Requirement: 会话卡片设计
会话卡片 SHALL 展示分类徽章、标题、内容摘要、时间信息和操作按钮。

#### Scenario: 卡片内容
- **WHEN** 系统渲染会话卡片
- **THEN** 卡片 SHALL 显示：
  - 分类徽章（卡片左上角，彩色圆角标签，对应该分类颜色，未分类不显示）
  - 置顶图标（已置顶会话在分类徽章前显示黄色图针图标）
  - 会话标题（单行显示，最多一行，超出显示省略号）
  - 内容摘要（灰色小字号，前两行摘要，最多两行截断）
  - 时间信息（"更新于 X 小时前" + "创建于 YYYY-MM-DD HH:mm"）
  - 操作按钮（右侧"..."更多操作按钮）

#### Scenario: 卡片悬停效果
- **WHEN** 鼠标悬停在会话卡片上
- **THEN** 卡片向上浮动 1px，阴影加深，边框变为紫色

#### Scenario: 卡片点击
- **WHEN** 用户点击会话卡片
- **THEN** 系统 SHALL 跳转到该会话的详情页面（根据 chat_mode 路由到对应页面）

### Requirement: 置顶会话区域
已置顶会话 SHALL 始终显示在列表顶部。

#### Scenario: 置顶会话展示
- **WHEN** 系统渲染会话列表
- **THEN** 已置顶会话（`is_pinned = TRUE`）显示在列表顶部区域
- **AND** 置顶会话之间无额外间距区分

#### Scenario: 分隔线
- **WHEN** 置顶会话区域下方存在普通会话
- **THEN** 系统 SHALL 显示"更早的会话"分隔线

### Requirement: 空状态
当分类下无会话时，列表 SHALL 显示空状态提示。

#### Scenario: 空状态显示
- **WHEN** 当前分类下没有会话记录
- **THEN** 系统 SHALL 居中显示空状态图标（文档图标）和提示文字"该分类下暂无会话记录"

### Requirement: 加载状态
列表加载时 SHALL 显示骨架屏动画。

#### Scenario: 骨架屏动画
- **WHEN** 系统正在加载会话列表
- **THEN** 每个卡片位置显示灰色脉冲动画（Skeleton 组件）

## MODIFIED Requirements

### Requirement: 会话点击路由（已有基础）
会话点击 SHALL 根据 `chat_mode` 路由到对应详情页。

#### Scenario: 普通会话路由
- **WHEN** 用户点击 `chat_mode = 'chat_react_agent'` 的会话卡片
- **THEN** 系统 SHALL 跳转到 `/?id=${convUid}&title=...`

#### Scenario: 应用会话路由
- **WHEN** 用户点击 `chat_mode = 'chat_excel'`（或其他非 chat_react_agent 类型）的会话卡片
- **THEN** 系统 SHALL 跳转到 `/chat?scene=${chat_mode}&id=${convUid}&title=...`

### Requirement: 会话搜索过滤（已有基础）
搜索 SHALL 按标题和内容摘要模糊匹配。

#### Scenario: 搜索结果联动
- **WHEN** 用户在搜索框输入关键词
- **THEN** 搜索 SHALL 在当前分类范围内过滤（即搜索结果属于当前选中的分类）

### Requirement: 分页支持
会话列表 SHALL 支持分页。

#### Scenario: 分页导航
- **WHEN** 会话总数超过单页容量（20 条）
- **THEN** 系统 SHALL 在列表底部显示分页组件
- **AND** 分类切换后重置到第一页

## ADDED Requirements - 批量操作

### Requirement: 批量操作栏
进入批量模式后，列表顶部 SHALL 显示批量操作栏。

#### Scenario: 批量操作栏内容
- **WHEN** 用户进入批量管理模式
- **THEN** 列表顶部固定显示批量操作栏，背景为紫色浅色，包含：
  - 已选计数（左侧显示"已选 N 项"，实时更新）
  - 移动到分类按钮（白色背景紫色边框）
  - 置顶按钮
  - 删除按钮（红色边框）
  - 取消按钮（退出批量模式）

#### Scenario: 取消批量模式
- **WHEN** 用户点击"取消"按钮
- **THEN** 系统 SHALL 退出批量模式，清空所有勾选状态

## ADDED Requirements - 多语言与主题

### Requirement: 多语言支持
会话列表 SHALL 支持多语言切换，所有文字标签实时更新。

### Requirement: 主题跟随
会话列表 SHALL 支持跟随主题（浅色/深色）即时更新。