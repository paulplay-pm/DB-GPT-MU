# Conversation Category Panel - Specification

## ADDED Requirements

### Requirement: 分类面板布局
分类面板 SHALL 位于页面左侧，宽度 224px，白色背景，与会话列表区通过细线边框分隔。

#### Scenario: 面板结构
- **WHEN** 用户访问报告页
- **THEN** 系统 SHALL 显示左侧 224px 分类面板，包含：
  - 面板头部："会话分类" 标题 + "+" 新建按钮
  - 系统分类区：全部会话、已置顶、未分类
  - 自定义分类区：用户创建的分类列表

#### Scenario: 分类项悬停效果
- **WHEN** 鼠标悬停在任意分类项上
- **THEN** 系统 SHALL 显示"..."更多操作按钮（自定义分类）或高亮背景（系统分类）

#### Scenario: 分类项激活状态
- **WHEN** 用户点击某个分类项
- **THEN** 系统 SHALL：
  - 左侧显示 3px 紫色竖线指示器
  - 背景色变为紫色渐变（从左向右由浅紫变为透明）
  - 文字颜色变为深色（#1E293B），字重为 500

### Requirement: 系统分类
系统分类 SHALL 提供预设的分类视角。

#### Scenario: 全部会话
- **WHEN** 用户点击"全部会话"
- **THEN** 系统 SHALL 显示该用户所有会话记录（按 `is_pinned DESC, gmt_modified DESC` 排序）

#### Scenario: 已置顶
- **WHEN** 用户点击"已置顶"
- **THEN** 系统 SHALL 显示该用户所有 `is_pinned = TRUE` 的会话记录

#### Scenario: 未分类
- **WHEN** 用户点击"未分类"
- **THEN** 系统 SHALL 显示该用户所有 `category_id IS NULL` 的会话记录

### Requirement: 新建分类弹窗
用户 SHALL 能创建新的自定义分类。

#### Scenario: 打开新建弹窗
- **WHEN** 用户点击分类面板头部的 "+" 按钮
- **THEN** 系统 SHALL 弹出居中弹窗（宽度 380px，圆角 16px），输入框自动获取焦点

#### Scenario: 新建分类内容
- **WHEN** 弹窗打开
- **THEN** 弹窗 SHALL 包含：
  - 标题"新建分类"，副标题"创建一个分类来组织你的会话记录"
  - 分类名称输入框（占位符"例如：销售分析、周报汇总..."，最多 20 字符）
  - 颜色选择器（7 种预设颜色：蓝、绿、紫、琥、红、粉、青，默认蓝色）
  - 底部按钮："取消"（灰色文字）和"创建"（紫色填充）

#### Scenario: 颜色选择交互
- **WHEN** 用户点击颜色选择器中的某个颜色
- **THEN** 选中的颜色显示圆环高亮效果，未选中的颜色悬停时显示淡化圆环

#### Scenario: 创建按钮禁用状态
- **WHEN** 分类名称为空或与已有分类重名
- **THEN** 系统 SHALL 禁用"创建"按钮，输入框显示红色边框提示

#### Scenario: 关闭弹窗
- **WHEN** 用户点击"取消"或弹窗外部遮罩或按 Esc 键
- **THEN** 系统 SHALL 关闭弹窗，不创建分类

### Requirement: 分类管理（重命名/删除）
自定义分类 SHALL 支持重命名和删除操作。

#### Scenario: 更多操作菜单
- **WHEN** 鼠标悬停在自定义分类项上
- **THEN** 右侧出现"..."更多操作按钮，点击后弹出上下文菜单（"重命名" / "删除分类"）

#### Scenario: 重命名分类
- **WHEN** 用户点击"重命名"
- **THEN** 分类名称变为可编辑状态（输入框），用户按回车确认或点击外部取消

#### Scenario: 删除分类确认弹窗
- **WHEN** 用户点击"删除分类"
- **THEN** 系统 SHALL 弹出确认弹窗，提示"删除后，该分类下的会话将移动到"未分类"，是否继续？"
- **AND** 提供"取消"和"确认删除"按钮

### Requirement: 分类计数徽章
每个分类 SHALL 显示对应会话数量。

#### Scenario: 显示计数徽章
- **WHEN** 渲染分类列表
- **THEN** 每个分类项右侧显示灰色背景圆角标签（如"5"）

#### Scenario: 实时更新徽章
- **WHEN** 用户将会话移动到/移出某个分类
- **THEN** 该分类的计数徽章实时更新

## MODIFIED Requirements

### Requirement: 会话列表分类筛选联动
分类面板切换时，右侧会话列表 SHALL 实时响应。

#### Scenario: 分类切换响应
- **WHEN** 用户点击不同分类
- **THEN** 右侧会话列表实时筛选显示对应分类下的会话
- **AND** 列表顶部计数标签更新（如"共 5 条"）

## ADDED Requirements - 多语言与主题

### Requirement: 多语言支持
分类面板 SHALL 支持多语言切换。

#### Scenario: 多语言切换
- **WHEN** 用户切换应用语言
- **THEN** 所有分类名称、会话标题、按钮文字 SHALL 实时更新为对应语言

### Requirement: 主题跟随
分类面板 SHALL 支持跟随主题（浅色/深色）即时更新。

#### Scenario: 深色模式
- **WHEN** 用户切换到深色模式
- **THEN** 分类面板背景色、文字颜色、边框颜色 SHALL 跟随主题更新