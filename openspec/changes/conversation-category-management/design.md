## Context

**现状：**
- 报告页仅有一个 Tab"会话记录"，列表展示有限（只显示 `chat_react_agent` 类型）
- 会话无分类概念，仅支持置顶/取消置顶/重命名/删除
- `chat_history` 表无分类关联字段

**目标：**
- 将报告页重构为三栏布局：左侧分类面板 + 右侧会话列表 + 批量操作栏
- 支持用户自定义分类（创建/重命名/删除）
- 会话归属分类（单选），三种移动方式

## Goals / Non-Goals

**Goals:**
- 用户可在左侧分类面板管理自定义分类
- 会话可通过右键菜单/批量操作/拖拽移动到分类
- 分类切换实时刷新会话列表，并显示对应计数
- 置顶会话独立展示在列表顶部，"更早的会话"分隔线区分普通会话

**Non-Goals:**
- 不支持一个会话属于多个分类
- 不支持在分类面板中查看其他用户的分类（管理员也只看自己的分类）
- 不支持分享会话给其他用户
- 不实现回收站/会话恢复功能（"删除"即删除）

## Decisions

### 决策 1：分类数据模型

**选择：** 新建 `conversation_categories` 表，通过 `category_id` 外键关联 `chat_history`

**理由：**
- 分类是用户级别的数据，独立表符合规范
- 一个分类可关联多条会话（1:N），外键在 `chat_history` 侧
- "未分类"通过 `category_id = NULL` 表示，无需特殊处理

**备选 1：** 在 `chat_history` 用逗号分隔存储多个分类 ID → 不支持多分类，排除

**备选 2：** 独立 `conversation_category_mapping` 关联表 → 过度设计，一会话一分类无需中间表

---

### 决策 2：分类面板放在左侧而非右侧

**选择：** 左侧 224px 分类面板，右侧会话列表

**理由：**
- PRD 原型图明确左侧分类，右侧内容
- 分类切换是主要导航操作，放在左侧符合 F 型阅读习惯
- 移动会话时拖拽方向自然（从右向左）

---

### 决策 3：移动到分类的 API 设计

**选择：** `POST /conversation/category/move` 批量移动接口

**接口设计：**
```
POST /conversation/category/move
Body: { conv_uids: string[], category_id: string | null }
```

- `category_id = null` 表示移动到"未分类"
- 支持批量移动（前端批量模式和单条移动共用此接口）

**备选：** 逐条调用 `PUT /conversation/{id}` 更新 `category_id`
- 缺点：批量操作时 N 次网络开销

---

### 决策 4：分类列表 API 是否支持分页

**选择：** 分类列表不分页（用户自定义分类数量有限）

**理由：**
- 用户自定义分类数量通常 ≤ 几十个，不需分页
- 简化前端状态管理

---

### 决策 5：前端组件结构

**选择：** 在 `reports/index.tsx` 基础上完全重构，不新建页面路由

**理由：**
- 复用现有 `/reports` 路由，无需新增
- 共享现有的 API 客户端和 i18n 配置

**组件拆分：**
```
CategoryPanel (侧边栏分类管理)
  ├── SystemCategories (系统分类: 全部/已置顶/未分类)
  ├── CustomCategories (自定义分类列表)
  └── CreateCategoryModal (新建分类弹窗)

ConversationList (右侧会话列表)
  ├── Toolbar (搜索框 + 批量管理按钮)
  ├── BatchActionBar (批量操作栏, 批量管理模式下显示)
  ├── PinnedSection (置顶会话区域)
  ├── Separator ("更早的会话"分隔线)
  ├── NormalSection (普通会话列表)
  └── EmptyState (空状态提示)

ConversationCard (会话卡片)
  └── MoreMenu (更多操作菜单)

MoveCategoryModal (移动到分类弹窗)
```

---

### 决策 6：拖拽实现方案

**选择：** 原生 HTML5 Drag and Drop API（不使用额外库）

**理由：**
- 只需支持桌面端，HTML5 DnD 足够
- Ant Design 有兼容性问题，引入额外依赖
- 拖拽状态通过 React context 管理（`DnDContext`）

**备选：** `react-dnd` 库 → 过度设计，增加 bundle size

---

### 决策 7：会话列表排序

**选择：** 置顶会话优先 → 按 `gmt_modified DESC` 排序

**理由：**
- `is_pinned DESC, gmt_modified DESC`（已在 chat-history-enhancement 中实现）
- 分类切换后共用同一排序逻辑

## Risks / Trade-offs

[Risk] 拖拽与滚动冲突
→ **Mitigation:** 拖拽时临时禁用右侧列表滚动，松开后恢复

[Risk] 批量移动时网络失败（部分成功）
→ **Mitigation:** 后端事务保证原子性；失败时前端回滚 UI 状态，显示错误提示

[Risk] 分类删除后会话迁移到"未分类"（"未分类"本质是 `category_id = NULL`）
→ **Mitigation:** 删除分类时后端批量 UPDATE `chat_history SET category_id=NULL WHERE category_id=X`

[Risk] 大量会话（>1000条）时分类列表加载慢
→ **Mitigation:** 前端分页 + 分类切换时重新请求 API（不在前端内存中过滤）

## Migration Plan

1. **数据库迁移**（生成 SQL 脚本）
   - 创建 `conversation_categories` 表
   - `chat_history` 新增 `category_id` 列（允许 NULL）
   - 现有会话 `category_id` 默认 NULL（归属"未分类"）

2. **后端部署**（无停机）
   - 先部署带新字段的数据库 migration
   - 再部署新 API 服务（新接口 + 旧接口向下兼容）
   - 前端静态文件同步更新

3. **验证**
   - 验证现有会话显示在"未分类"
   - 验证分类 CRUD 正常
   - 验证会话移动正常

**Rollback:** 回滚前端构建产物即可恢复旧版页面

## Open Questions

- 无
