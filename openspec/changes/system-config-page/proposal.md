## Why

系统配置页面是管理员管理平台基础参数的统一入口。当前 DB-GPT 的产品名称、Logo、标语等均为硬编码，无法满足管理员自定义品牌的需求。

## What Changes

**后端 (Brand Info)：**
- 新建 `dbgpt-serve/system_config/` 模块，包含 service、endpoint
- 新增 `SystemConfig` 数据库表，存储品牌配置
- 提供 Brand Info CRUD API：
  - `GET /api/v1/system-config/brand` — 获取品牌配置
  - `PUT /api/v1/system-config/brand` — 更新品牌配置
  - `POST /api/v1/system-config/logo` — 上传 Logo

**前端 (5 个 Tab)：**
- 新建 `web/pages/admin/system-config.tsx` 页面
- **品牌信息 Tab**：Logo 上传、产品名称、Slogan（后端对接）
- **记忆管理 Tab**：纯前端界面，mock 数据
- **安全设置 Tab**：纯前端界面，mock 数据
- **通知设置 Tab**：纯前端界面，mock 数据
- **高级设置 Tab**：纯前端界面，mock 数据

**BREAKING:**
- 无破坏性变更

## Capabilities

### New Capabilities
- `system-config-brand`: 品牌信息配置（Logo、产品名称、Slogan）
- `system-config-ui`: 系统配置页面（5 个 Tab 完整前端）

### Modified Capabilities
- 无

## Impact

**后端新增：**
- `packages/dbgpt-serve/src/dbgpt_serve/system_config/` — 新模块
  - `service/brand_service.py` — 品牌配置服务
  - `api/endpoints.py` — API 端点
  - `api/schemas.py` — Pydantic 模型

**前端新增：**
- `web/pages/admin/system-config.tsx` — 系统配置页面
- `web/client/api/system_config.ts` — API 客户端

**导航配置：**
- `web/components/layout/NewSideBar/config.ts` — 添加"系统配置"菜单项

**测试范围：**
- Brand Info API：单元测试 + 接口测试
- 前端页面：E2E 测试验证 Tab 切换、表单交互