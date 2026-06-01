## 1. 后端基础设施

- [x] 1.1 创建 `dbgpt-serve/src/dbgpt_serve/system_config/` 目录结构（`__init__.py`, `service/`, `api/`, `models/`）
- [x] 1.2 定义 `SystemConfig` SQLAlchemy 模型，包含 `logo_url`, `product_name_zh`, `product_name_en`, `slogan` 字段
- [x] 1.3 创建 `service/brand_service.py`，实现品牌配置的 CRUD 操作
- [x] 1.4 创建 `api/endpoints.py`，实现 `GET /api/v1/system-config/brand`、`PUT /api/v1/system-config/brand`、`POST /api/v1/system-config/logo` 接口
- [x] 1.5 在 `dbgpt-serve` 模块的 `__init__.py` 或路由注册处添加 system_config 路由前缀

**规范校验清单：**
- [x] GET 接口无数据时返回默认值 `product_name_zh: "DB-GPT"`, `product_name_en: "DB-GPT"`, `slogan: "开口问数，预见洞察"`, `logo_url: null`
- [x] PUT 接口接受部分更新，只更新传入的字段
- [x] POST logo 接口返回 `{"logo_url": "/uploads/logos/xxx.png"}`
- [x] 所有接口仅允许 admin 角色访问

**安全校验清单：**
- [x] logo 上传校验文件类型（SVG, PNG, JPG）和大小
- [x] SQLAlchemy 模型使用参数化查询防注入
- [x] 接口权限校验确认 admin 角色

## 2. 前端页面结构

- [x] 2.1 创建 `web/pages/admin/system-config.tsx` 页面，路由 `/admin/system-config`
- [x] 2.2 实现面包屑导航 `系统管理 > 系统配置`
- [x] 2.3 实现页面标题 `系统配置` 及副标题
- [x] 2.4 实现 5 个水平 Tab 导航（品牌信息、记忆管理、安全设置、通知设置、高级设置），底部蓝色下划线标识选中态
- [x] 2.5 实现内容区域最大宽度 1024px 居中，白色卡片纵向排列
- [x] 2.6 实现底部操作栏，左侧提示文字 + 右侧 Reset 和 Save 按钮

**规范校验清单：**
- [x] Tab 切换时内容区域正确切换
- [x] 当前激活 Tab 为蓝色文字 + 蓝色下划线
- [x] 非激活 Tab 为灰色文字，无下划线

## 3. 品牌信息 Tab（后端对接）

- [x] 3.1 实现当前 Logo 预览区域（96×96px，虚线边框，灰色背景）
- [x] 3.2 实现 Logo 上传区域（拖拽上传 + 点击上传，悬停蓝色边框）
- [x] 3.3 实现产品名称表单（中文名称、英文名称输入框）
- [x] 3.4 实现标语输入框
- [x] 3.5 创建 `web/client/api/system_config.ts` API 客户端（集成到 request.ts）
- [x] 3.6 Logo 上传触发 `POST /api/v1/system-config/logo`，预览更新
- [x] 3.7 Save 按钮触发 `PUT /api/v1/system-config/brand`，显示成功 Toast

**规范校验清单：**
- [x] 支持 SVG、PNG、JPG 格式上传
- [x] 上传失败显示红色边框和错误提示
- [x] 保存成功显示 "配置已保存" Toast
- [x] 表单提交前进行格式校验（标语不超过 20 字符建议值）

## 4. 记忆管理 Tab（前端 Mock）

- [x] 4.1 实现 4 个统计卡片（总记忆条数蓝色、今日新增绿色、覆盖用户数紫色、准确率橙色）
- [x] 4.2 实现蒸馏策略配置（自动蒸馏 Toggle、蒸馏触发频率、置信度阈值、单用户最大记忆数）
- [x] 4.3 实现记忆类型选择（用户偏好蓝色、数据知识绿色、分析模式紫色、业务术语橙色），每项 Toggle 开关
- [x] 4.4 实现操作按钮（查看全部记忆、Manual trigger distillation、清除全部记忆红色）

**规范校验清单：**
- [x] 4 个卡片彩色背景区分正确
- [x] Toggle 开关状态正确（默认开/关与 PRD 一致）
- [x] 数字输入框支持步进
- [x] 清除全部记忆有二次确认

## 5. 安全设置 Tab（前端 Mock）

- [x] 5.1 实现密码策略配置（密码最小长度、密码过期天数、登录失败锁定次数）
- [x] 5.2 实现会话安全配置（会话超时时间、单设备登录限制 Toggle）
- [x] 5.3 实现数据安全配置（SQL 查询行数限制、禁止执行 DDL Toggle、敏感数据脱敏 Toggle）

**规范校验清单：**
- [x] 数字输入框宽度 96px 居中
- [x] Toggle 开关样式统一（灰色轨道白色滑块开启蓝色）
- [x] 每项左右布局：左侧配置名称 + 描述，右侧输入框

## 6. 通知设置 Tab（前端 Mock）

- [x] 6.1 实现 SMTP 配置表单（服务器、端口、发件人邮箱、发件人名称、SMTP 密码、SSL/TLS Toggle）
- [x] 6.2 实现通知场景开关（新用户注册、用户审核请求、系统异常告警、数据源连接失败）

**规范校验清单：**
- [x] SMTP 服务器和端口双列布局
- [x] 其他字段单列布局
- [x] 密码输入框不可见
- [x] SSL/TLS Toggle 默认开启

## 7. 高级设置 Tab（前端 Mock）

- [x] 7.1 实现系统维护操作（清除系统缓存、Rebuild semantic index、Reset system config 红色）
- [x] 7.2 实现系统信息展示（系统版本、部署模式、Python 版本、数据库类型、运行时间、活跃用户数）

**规范校验清单：**
- [x] 维护操作左右布局，左侧名称+描述，右侧按钮
- [x] 重置系统配置红色按钮 + 二次确认弹窗
- [x] 系统信息双列键值对展示

## 8. 导航集成

- [x] 8.1 在 `web/components/layout/NewSideBar/config.ts` 添加"系统配置"菜单项，位置：系统管理分组，权限管理之后
- [x] 8.2 使用图标 `SettingOutlined`，仅管理员角色可见

**规范校验清单：**
- [x] 菜单项出现在正确位置
- [x] 非管理员用户看不到此菜单项

## 9. 后端测试

- [x] 9.1 编写 Brand Config API 单元测试，覆盖场景：
  - GET 无数据时返回默认值
  - GET 有数据时返回实际数据
  - PUT 部分更新
  - POST logo 上传返回 logo_url
- [x] 9.2 编写权限测试，确认 admin 角色可访问，非 admin 被拒绝

**规范校验清单：**
- [x] 所有测试通过 `pytest` 运行
- [x] 测试覆盖正常流程和异常分支

## 10. 前端 E2E 验证

- [x] 10.1 验证 5 个 Tab 切换正常
- [x] 10.2 验证 Brand Info 表单提交成功（PUT API 被调用）
- [x] 10.3 验证 Logo 上传交互正常（拖拽、预览）
- [x] 10.4 验证 Reset 按钮恢复到上次保存的值

**规范校验清单：**
- [x] 所有 Tab 可切换且内容正确
- [x] 表单提交后 Toast 提示显示
- [x] Reset 正确恢复表单状态