# Conversation Category - Specification

## ADDED Requirements

### Requirement: 分类数据模型
系统 SHALL 提供分类数据模型，用于组织用户会话记录。

#### Scenario: 创建新分类
- **WHEN** 用户在分类面板点击"+"按钮并填写名称和颜色后点击"创建"
- **THEN** 系统 SHALL 在 `conversation_categories` 表中创建一条新记录，字段包括 `category_id`（自增主键）、`user_name`（用户标识）、`name`（分类名称）、`color`（颜色值）、`gmt_created`

#### Scenario: 查询用户的所有分类
- **WHEN** 系统需要渲染分类面板
- **THEN** 系统 SHALL 返回当前用户的所有自定义分类，按 `gmt_created ASC` 排序

#### Scenario: 重命名分类
- **WHEN** 用户悬停分类项并点击"..."→"重命名"，输入新名称后按回车
- **THEN** 系统 SHALL 更新该分类的 `name` 字段并返回更新后的分类

#### Scenario: 删除分类
- **WHEN** 用户悬停分类项并点击"..."→"删除分类"并确认
- **THEN** 系统 SHALL 删除该分类，并将该分类下所有会话的 `category_id` 设为 NULL（归入"未分类"）

#### Scenario: 会话归属分类
- **WHEN** 系统查询某分类下的会话列表
- **THEN** 系统 SHALL 只返回 `category_id` 等于该分类 ID 的会话记录
- **AND** 当 `category_id = NULL` 时归属"未分类"

### Requirement: 分类 API 接口
系统 SHALL 提供分类相关的 REST API 接口。

#### Scenario: 创建分类 API
- **WHEN** 调用 `POST /conversation/category/create` 并传入 `{ user_name, name, color }`
- **THEN** 系统 SHALL 返回新建的分类对象（含 `category_id`）

#### Scenario: 重命名分类 API
- **WHEN** 调用 `PUT /conversation/category/{category_id}/rename` 并传入 `{ name }`
- **THEN** 系统 SHALL 更新分类名称并返回更新后的分类对象

#### Scenario: 删除分类 API
- **WHEN** 调用 `DELETE /conversation/category/{category_id}`
- **THEN** 系统 SHALL 删除分类并将所属会话的 `category_id` 设为 NULL

#### Scenario: 查询分类列表 API
- **WHEN** 调用 `GET /conversation/category/list?user_name=xxx`
- **THEN** 系统 SHALL 返回该用户所有自定义分类列表

#### Scenario: 移动会话到分类 API
- **WHEN** 调用 `POST /conversation/category/move` 并传入 `{ conv_uids: [], category_id: string | null }`
- **THEN** 系统 SHALL 将所有指定会话的 `category_id` 更新为目标值

### Requirement: 数据库迁移
系统 SHALL 提供数据库迁移脚本。

#### Scenario: 新建分类表
- **WHEN** 执行数据库迁移脚本
- **THEN** 系统 SHALL 创建 `conversation_categories` 表，包含字段：`category_id`（INT 主键自增）、`user_name`（VARCHAR(128) 用户标识）、`name`（VARCHAR(50) 分类名称）、`color`（VARCHAR(20) 颜色值）、`gmt_created`（DATETIME 创建时间）

#### Scenario: 新增 category_id 列
- **WHEN** 执行数据库迁移脚本
- **THEN** 系统 SHALL 在 `chat_history` 表新增 `category_id` 列（INT DEFAULT NULL 外键关联 `conversation_categories.category_id`）
- **AND** 现有会话 `category_id` 默认为 NULL（归属"未分类"）

## ADDED Requirements - 安全与权限

### Requirement: 权限控制
分类数据 SHALL 遵循用户隔离原则。

#### Scenario: 用户只能操作自己的分类
- **WHEN** 用户 A 尝试访问/删除用户 B 的分类
- **THEN** 系统 SHALL 返回 403 Forbidden 或 404 Not Found

#### Scenario: 会话归属权限
- **WHEN** 用户 A 尝试将用户 B 的会话移动到自己创建的分类
- **THEN** 系统 SHALL 返回 403 Forbidden

## ADDED Requirements - 测试要求

### Requirement: 单元测试覆盖率 ≥80%
系统 SHALL 为分类 CRUD 操作提供单元测试，覆盖正常流程和异常流程（空名称、重复名称、无权限访问等）。
