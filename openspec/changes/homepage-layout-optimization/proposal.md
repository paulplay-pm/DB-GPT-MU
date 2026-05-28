## Why

当前 DB-GPT 首页（`pages/index.tsx`）的布局存在以下问题：

1. **布局顺序不合理**：推荐卡片位于输入框下方，不够醒目；输入框位置不符合聊天应用习惯
2. **视觉层次不够清晰**：顶部 slogan 过于冗长（"DB-GPT AI数据助理" + "Agentic Data Driven Decisions"）
3. **信息密度可提升**：卡片间距较大，页面较为空旷

参考 Image #7 的交互风格进行优化：卡片上移至输入框上方，输入框固定底部，视觉更紧凑。

## What Changes

### 1. 布局结构调整

- 移除顶部大型 title + subtitle，替换为简洁 slogan "开口问数，看见洞察"
- 推荐卡片移至输入框上方（DOM 顺序调整）
- 卡片采用横向排列（2x2 网格，移动端响应式）
- 输入框保持底部位置，自然形成聊天应用习惯

### 2. 卡片设计优化

- 每张卡片顶部增加 8px 高度渐变色条，匹配各卡片主题色
- 卡片间距收紧，更加紧凑
- 移除 "推荐示例" 分隔标题

### 3. i18n 国际化

- 新增 `home_slogan` 翻译 key
- 中文：`开口问数，看见洞察`
- 英文：`Ask Data, See Insights`

## Capabilities

### New Capabilities
- `homepage-slogan`: 首页简洁 slogan 展示

### Modified Capabilities
- `homepage-cards`: 卡片位置上移、添加渐变色条、改为横向响应式布局
- `homepage-input`: 输入框位置保持底部，交互习惯不变

## Impact

**文件变更：**
- 修改：`web/pages/index.tsx`（Welcome Mode 区域重构）
- 修改：`web/locales/zh/common.ts`（新增 `home_slogan`）
- 修改：`web/locales/en/common.ts`（新增 `home_slogan`）

**测试范围：**
- 单元测试：卡片组件渲染、渐变色条颜色正确
- 集成测试：响应式布局（移动端 2x2、桌面端 1x4）、输入框固定底部
- 视觉回归：截图对比优化前后布局差异

**安全检查项：**
- 无新增 API 调用
- 无敏感信息泄露
- 仅前端样式调整

## Non-goals

- 不修改输入框功能逻辑
- 不修改推荐卡片的点击行为
- 不修改移动端 `/mobile/chat` 页面
