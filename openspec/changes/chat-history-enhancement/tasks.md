# Chat History Enhancement - Tasks

## 1. Database Schema

- [ ] 1.1 创建数据库升级脚本 `assets/schema/upgrade/v0_9_0/dbgpt.sql`，包含 `is_pinned` 列和索引

**规范校验清单：**
- [ ] SQL 语法正确，使用 `ALTER TABLE` 添加列
- [ ] 包含列注释说明用途
- [ ] 创建适当索引优化查询性能

**安全校验清单：**
- [ ] 默认值为 `FALSE`，避免数据泄露风险
- [ ] 索引命名不包含敏感信息

**数据迁移 SQL 脚本：**
```sql
-- 添加 is_pinned 列
ALTER TABLE `chat_history` ADD COLUMN `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Whether the session is pinned';

-- 创建索引
CREATE INDEX `idx_chat_history_is_pinned` ON `chat_history`(`is_pinned`);
```

## 2. Backend Entity Updates

- [ ] 2.1 在 `ChatHistoryEntity` 中添加 `is_pinned` 字段
- [ ] 2.2 在 `StorageConversation.__init__()` 中添加 `is_pinned` 参数
- [ ] 2.3 更新 `DBStorageConversationItemAdapter.to_storage_format()` 包含 `is_pinned`
- [ ] 2.4 更新 `DBStorageConversationItemAdapter.from_storage_format()` 读取 `is_pinned`

**规范校验清单：**
- [ ] 遵循 DB-GPT 原生风格
- [ ] 类型注解正确（`bool` vs `Optional[bool]`）
- [ ] 字段默认值合理

**安全校验清单：**
- [ ] 不暴露内部实现细节到 API
- [ ] 字段赋值经过验证

## 3. Backend API Schema

- [ ] 3.1 在 `ServerResponse` schema 中添加 `is_pinned` 字段
- [ ] 3.2 更新 `ServeDao.to_response()` 映射 `is_pinned` 字段
- [ ] 3.3 更新 `get_conv_by_page()` 排序逻辑为 `is_pinned DESC, gmt_modified DESC`

**规范校验清单：**
- [ ] Pydantic 模型字段有正确注释
- [ ] 排序使用 SQLAlchemy 的 `order_by()`
- [ ] 分页逻辑正确处理排序

**安全校验清单：**
- [ ] API 响应不包含敏感字段
- [ ] 排序字段已索引，防止慢查询

## 4. Backend Service and Endpoints

- [ ] 4.1 在 Service 中添加 `pin()` 方法
- [ ] 4.2 在 Service 中添加 `unpin()` 方法
- [ ] 4.3 在 Service 中添加 `rename()` 方法
- [ ] 4.4 添加 `POST /pin` 端点
- [ ] 4.5 添加 `POST /unpin` 端点
- [ ] 4.6 添加 `POST /rename` 端点
- [ ] 4.7 在前端 API 客户端添加 `pinDialogue`, `unpinDialogue`, `renameDialogue` 函数

**规范校验清单：**
- [ ] 异步方法使用 `async def`
- [ ] 错误处理使用 `try/catch`
- [ ] 日志记录关键操作

**安全校验清单：**
- [ ] 验证 `conv_uid` 格式
- [ ] 检查用户权限（仅所有者可操作）
- [ ] 防止 SQL 注入（使用参数化查询）

**单元测试覆盖 ≥80%：**
- [ ] 4.8 测试 `Service.pin()` 方法
- [ ] 4.9 测试 `Service.unpin()` 方法
- [ ] 4.10 测试 `Service.rename()` 方法
- [ ] 4.11 测试 `/pin` 端点
- [ ] 4.12 测试 `/unpin` 端点
- [ ] 4.13 测试 `/rename` 端点

## 5. Summary Lock Logic

- [ ] 5.1 修改 `StorageConversation.save_to_storage()` 只在首次保存时设置 summary
- [ ] 5.2 验证后续消息不更新 summary 字段
- [ ] 5.3 验证用户 rename 后不会被覆盖

**规范校验清单：**
- [ ] 遵循 OnceConversation 的设计模式
- [ ] 代码逻辑清晰，注释说明意图
- [ ] 处理边界情况（空 summary、空消息列表）

**安全校验清单：**
- [ ] 防止 XSS（summary 可能显示在 UI）
- [ ] 长度限制防止存储浪费

**单元测试覆盖 ≥80%：**
- [ ] 5.4 测试新对话首次保存 summary 正确
- [ ] 5.5 测试后续消息不更新 summary
- [ ] 5.6 测试 rename 后 summary 保持不变
- [ ] 5.7 测试重新加载后 summary 正确恢复

## 6. Frontend UI

- [ ] 6.1 在 `locales/zh/chat.ts` 添加 `update_time` 和 `created_at` 翻译
- [ ] 6.2 在 `locales/en/chat.ts` 添加 `update_time` 和 `created_at` 翻译
- [ ] 6.3 在 `pages/reports/index.tsx` 中更新显示格式，展示 "更新: x minutes ago"
- [ ] 6.4 添加 "创建: yyyy-mm-dd hh:mm" 显示
- [ ] 6.5 添加 pin/unpin 按钮和逻辑
- [ ] 6.6 添加 inline rename 输入框和确认/取消逻辑

**规范校验清单：**
- [ ] React 组件化良好
- [ ] TypeScript 类型严格校验
- [ ] Hooks 规范（useState, useCallback 依赖正确）
- [ ] 状态隔离（避免 prop drilling）

**安全校验清单：**
- [ ] XSS 防护（用户输入的 summary 转义）
- [ ] 权限渲染校验（根据用户角色显示操作按钮）
- [ ] 租户隔离渲染（如适用）

**单元测试覆盖 ≥80%：**
- [ ] 6.7 测试时间格式化函数
- [ ] 6.8 测试 pin/unpin 切换逻辑
- [ ] 6.9 测试 rename 确认/取消流程
- [ ] 6.10 测试 Hover 状态显示正确

## 7. Integration Testing

- [ ] 7.1 端到端测试：创建对话 → 验证 summary = 首次输入 → 发送更多消息 → 验证 summary 不变 → rename → 验证 rename 值保持
- [ ] 7.2 端到端测试：pin 对话 → 刷新页面 → 验证 pin 状态保持
- [ ] 7.3 数据库回滚测试：验证 `is_pinned` 列可安全回滚
- [ ] 7.4 多租户隔离测试：验证租户只能操作自己的对话

## 8. Documentation

- [ ] 8.1 更新 API 文档，说明新增端点用法
- [ ] 8.2 更新数据库 schema 文档