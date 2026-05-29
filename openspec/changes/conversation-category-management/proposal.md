## Why

当前报告页的会话记录功能简陋：仅支持单一列表展示，无分类管理能力。用户无法对大量历史会话进行组织归类，无法批量操作，定位和复用历史分析结果的效率低下。

## What Changes

- **新增分类管理模块**：左侧分类面板，支持系统分类（全部/已置顶/未分类）和用户自定义分类（创建/重命名/删除）
- **新增会话-分类关联**：`chat_history` 表新增 `category_id` 字段，一个会话归属一个分类
- **三种会话移动方式**：单条右键菜单、批量选择模式、拖拽到左侧分类面板
- **完整替换报告页**：现有报告页完全替换为新的三栏布局（分类面板 + 会话列表 + 批量操作栏）
- **分类计数徽章**：每个分类右侧显示对应会话数量
- **置顶区域独立展示**：已置顶会话显示在列表顶部，下方通过"更早的会话"分隔线与普通会话分开
- **新建分类弹窗**：支持输入分类名称（≤20字符）+ 选择颜色（7种预设色）
- **移动到分类弹窗**：单条和批量操作共用分类选择弹窗
- **后端 CRUD 接口**：分类的创建/重命名/删除/列表 API

## Capabilities

### New Capabilities

- `conversation-category`: 会话分类数据模型
  - 数据库表 `conversation_categories`（category_id, user_id, name, color, gmt_created）
  - `chat_history.category_id` 外键关联（允许 NULL 表示未分类）
  - 分类 CRUD API（创建/重命名/删除/列表/查询）

- `conversation-category-panel`: 分类面板组件
  - 左侧 224px 分类面板，支持系统分类 + 自定义分类切换
  - 分类选中高亮状态 + 计数徽章
  - 新建分类弹窗（名称 + 颜色选择）
  - 分类悬停显示"..."更多操作（重命名/删除）

- `conversation-list-with-category`: 分类联动会话列表
  - 分类切换实时刷新右侧会话列表
  - 搜索框（实时搜索，联动当前分类）
  - 会话卡片显示分类徽章（颜色对应）、标题、内容摘要、时间信息
  - 悬停卡片浮动 + 边框高亮效果
  - "更早的会话"分隔线

- `conversation-batch-operations`: 批量会话操作
  - 进入批量管理模式（显示复选框）
  - 批量操作栏（已选计数、移动到分类、置顶、删除、取消）
  - 单条会话"更多"菜单（移动到分类、取消置顶、重命名、删除）
  - 移动到分类弹窗（分类列表 + 颜色圆点）

- `conversation-drag-drop`: 拖拽移动会话
  - 拖拽会话卡片到左侧分类面板
  - 目标分类高亮拖入指示效果
  - 松手执行移动并更新徽章

## Impact

| 范围 | 影响 |
|------|------|
| 数据库 | 新建 `conversation_categories` 表；`chat_history` 表新增 `category_id` 列 |
| 后端 API | 新增 `POST/DELETE/PUT /conversation/category/*` 端点；`query_page` 支持按 category_id 过滤 |
| 前端页面 | `web/pages/reports/index.tsx` 完全重写；新增分类面板组件、批量操作栏组件 |
| 测试 | 单元测试覆盖 category CRUD、批量移动、拖拽交互；E2E 覆盖完整用户流程 |

### 数据库迁移脚本

- `conversation_categories` 建表 SQL
- `chat_history` 新增 `category_id` 列（DEFAULT NULL）
- 现有会话 `category_id` 默认为 NULL（归属"未分类"）
