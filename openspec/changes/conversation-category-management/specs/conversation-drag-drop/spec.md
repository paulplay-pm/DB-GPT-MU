# Conversation Drag and Drop - Specification

## ADDED Requirements

### Requirement: 拖拽会话卡片到分类面板
用户 SHALL 能通过拖拽会话卡片到左侧分类面板的方式，将会话移动到目标分类。

#### Scenario: 拖拽开始
- **WHEN** 用户在会话卡片上按下鼠标并开始拖动
- **THEN** 卡片显示拖拽态（透明度降低，添加阴影）
- **AND** 左侧分类面板显示为可投放目标区域

#### Scenario: 拖拽经过分类面板
- **WHEN** 用户拖动卡片经过某个分类项上方
- **THEN** 该分类项显示高亮背景色（紫色半透明）
- **AND** 在分类项下方显示投放指示线

#### Scenario: 拖拽释放到有效分类
- **WHEN** 用户在某个分类项上方释放卡片
- **THEN** 系统 SHALL 调用 `POST /conversation/category/move` 接口
- **AND** 将该会话的 `category_id` 更新为目标分类 ID
- **AND** 更新分类计数徽章

#### Scenario: 拖拽释放到系统分类
- **WHEN** 用户拖动卡片到"全部会话"、"已置顶"或"未分类"系统分类上方并释放
- **THEN** 系统 SHALL 显示错误提示"系统分类不支持拖拽放置"
- **AND** 会话保持原分类不变

#### Scenario: 拖拽取消（释放在空白区域）
- **WHEN** 用户在非分类面板区域释放卡片
- **THEN** 会话保持原分类不变
- **AND** 卡片恢复原状

### Requirement: 拖拽状态管理
系统 SHALL 通过 React Context 管理拖拽状态。

#### Scenario: DnDContext 提供状态
- **WHEN** 拖拽会话卡片开始
- **THEN** `DnDContext` SHALL 记录 `draggingConvUid`（被拖拽会话的 UID）
- **AND** `draggingOverCategoryId`（当前悬停的分类 ID，初始为 null）

#### Scenario: 拖拽经过分类项
- **WHEN** 拖拽中的卡片经过某个分类项上方
- **THEN** 更新 `draggingOverCategoryId` 为该分类 ID
- **AND** 该分类项显示投放高亮

#### Scenario: 拖拽离开分类项
- **WHEN** 拖拽中的卡片离开某个分类项上方
- **THEN** 重置 `draggingOverCategoryId` 为 null
- **AND** 清除投放高亮

#### Scenario: 拖拽结束
- **WHEN** 拖拽操作完成（无论成功或取消）
- **THEN** 重置 `DnDContext` 中的所有拖拽状态
- **AND** 清除所有分类项的高亮显示

### Requirement: 批量模式下的拖拽限制
批量管理模式 SHALL 禁用拖拽功能。

#### Scenario: 批量模式禁止拖拽
- **WHEN** 用户进入了批量管理模式（显示了复选框和批量操作栏）
- **THEN** 会话卡片的拖拽功能 SHALL 被禁用
- **AND** 鼠标样式保持默认（不显示 grab 样式）

### Requirement: 拖拽视觉反馈
拖拽过程 SHALL 提供清晰的视觉反馈。

#### Scenario: 拖拽中的卡片样式
- **WHEN** 用户拖动会话卡片
- **THEN** 卡片 SHALL 显示：
  - 透明度降低至 0.7
  - 阴影加深
  - 鼠标样式为 grabbing

#### Scenario: 目标分类高亮
- **WHEN** 拖拽中的卡片悬停在某个自定义分类上方
- **THEN** 该分类项 SHALL 显示：
  - 背景色变为紫色半透明（rgba(139, 92, 246, 0.1)）
  - 左侧显示投放指示竖线（3px 紫色）