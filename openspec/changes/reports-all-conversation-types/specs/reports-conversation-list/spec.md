# Reports Conversation List - Specification

## ADDED Requirements

### Requirement: 报告页会话列表支持所有会话类型
报告页的"会话记录"标签页 SHALL 返回并展示所有 `chat_mode` 类型的会话记录，不再按 `chat_mode` 过滤。

#### Scenario: 列表展示所有类型会话
- **WHEN** 用户进入"我的报告"页面并点击"会话记录"标签
- **THEN** 系统 SHALL 显示包含普通会话（`chat_react_agent`）和应用会话（`chat_excel`、`chat_agent` 等）的完整列表

#### Scenario: 按置顶优先、最新修改时间倒序排列
- **WHEN** 系统加载会话列表
- **THEN** 会话列表 SHALL 首先按 `is_pinned DESC` 排序，再按 `gmt_modified DESC` 排序（最新在前）

#### Scenario: 列表项显示创建时间
- **WHEN** 系统渲染每个会话列表项
- **THEN** 系统 SHALL 显示 `gmt_created` 字段（格式：`YYYY-MM-DD HH:mm`）

### Requirement: 会话点击路由到正确的详情页
用户点击列表中的会话项时，系统 SHALL 根据 `chat_mode` 跳转到对应的对话详情页。

#### Scenario: 点击普通会话跳转
- **WHEN** 用户点击 `chat_mode = 'chat_react_agent'` 的会话项
- **THEN** 系统 SHALL 跳转到 `/chat?scene=chat_react_agent&id=${conv_uid}&title=${encoded_title}`

#### Scenario: 点击应用会话跳转
- **WHEN** 用户点击 `chat_mode = 'chat_excel'`（或其他非 `chat_react_agent` 类型）的会话项
- **THEN** 系统 SHALL 跳转到 `/chat?scene=${chat_mode}&id=${conv_uid}&title=${encoded_title}`

### Requirement: 会话操作功能正常
系统 SHALL 支持置顶/取消置顶、重命名、删除操作。

#### Scenario: 置顶会话
- **WHEN** 用户点击列表项的置顶图标（当前未置顶）
- **THEN** 系统 SHALL 调用 `POST /pin` 接口，列表项 SHALL 移至顶部并显示置顶样式

#### Scenario: 取消置顶
- **WHEN** 用户点击列表项的置顶图标（当前已置顶）
- **THEN** 系统 SHALL 调用 `POST /unpin` 接口，列表项 SHALL 移除置顶样式并回到按时间排序的位置

#### Scenario: 重命名会话
- **WHEN** 用户点击编辑图标并确认新名称
- **THEN** 系统 SHALL 调用 `POST /rename` 接口，`summary` 字段 SHALL 更新为新名称

#### Scenario: 删除会话
- **WHEN** 用户确认删除会话
- **THEN** 系统 SHALL 调用 `POST /delete` 接口，列表项 SHALL 从 UI 移除

### Requirement: 搜索过滤功能
系统 SHALL 支持按会话标题关键词搜索。

#### Scenario: 按关键词搜索
- **WHEN** 用户在搜索框输入关键词
- **THEN** 系统 SHALL 只显示 `user_input` 包含该关键词的会话项（区分大小写）

### Requirement: 分页功能
系统 SHALL 支持分页加载会话列表。

#### Scenario: 分页导航
- **WHEN** 会话总数超过单页容量（20条）
- **THEN** 系统 SHALL 显示分页组件，允许用户切换页面
