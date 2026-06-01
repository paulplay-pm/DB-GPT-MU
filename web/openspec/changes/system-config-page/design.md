## Context

**当前状态：**
- DB-GPT 产品名称、Logo、Slogan 均为硬编码
- `NewSideBar` 中 "DB-GPT" 文字硬编码在组件内
- 首页 Slogan "开口问数，预见洞察" 无配置机制

**约束：**
- Brand Info 后端需对接，记忆/安全/通知/高级设置为纯前端 mock
- 系统配置页面仅管理员角色可见
- Logo 存储需考虑文件管理

## Goals / Non-Goals

**Goals:**
- 新建 `system_config` 后端模块，提供 Brand Info CRUD API
- 新建系统配置页面，5 个 Tab 完整 UI
- 品牌信息 Tab 与后端对接，实时生效
- 其他 4 个 Tab 为完整 UI 但数据暂存前端状态

**Non-Goals:**
- 记忆管理后端功能（未来扩展）
- 安全设置后端功能（未来扩展）
- 通知设置后端功能（未来扩展）
- 页脚版权信息（PRD 中移除）
- 配置在导航栏/首页的实时读取（由读取方各自实现，只需 API 可用）

## Decisions

**决策 1: 使用独立 SystemConfig 表存储品牌配置**

原因：
- 简单直接，与现有配置体系无耦合
- 便于扩展其他配置项

替代方案：使用 Key-Value 配置表
→ 未采纳：Brand Info 字段固定，Key-Value 过于灵活

**决策 2: Logo 存储为文件路径/URL**

原因：
- 上传接口返回文件路径，前端存储到配置表
- 便于 CDN 或本地文件服务

**决策 3: 非 Brand Info Tab 使用 useState mock**

原因：
- PRD 明确仅 Brand Info 需要后端
- 保持 UI 完整性，便于后期扩展

## API 设计

```
GET    /api/v1/system-config/brand          # 获取品牌配置
PUT    /api/v1/system-config/brand            # 更新品牌配置
POST   /api/v1/system-config/logo            # 上传 Logo 文件
```

### Brand Config Schema
```json
{
  "logo_url": "string (optional)",
  "product_name_zh": "DB-GPT",
  "product_name_en": "DB-GPT",
  "slogan": "开口问数，预见洞察"
}
```

## Risks / Trade-offs

[风险] Logo 上传后文件管理
→ 缓解：使用现有文件服务基础设施

[风险] 前端 mock 数据无法持久化
→ 缓解：这是已知限制，PRD 要求的范围

## Open Questions

无

## 测试架构

**后端测试：**
- Brand Info API 单元测试
- Logo 上传接口测试

**前端 E2E：**
- 5 个 Tab 切换正常
- Brand Info 表单提交成功
- Logo 上传交互正常