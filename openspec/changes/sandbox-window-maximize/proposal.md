## Why

当前沙盒窗口（`ManusRightPanel`）没有最大化功能，用户无法将右侧结果面板扩展为全屏视图以获得更好的工作体验。当前的 macOS 风格红黄绿圆点按钮仅为装饰性，没有任何实际功能。实现最大化功能可显著提升用户在执行代码、查看 HTML 预览等场景下的操作空间。

## What Changes

- **移除**：沙盒窗口标题栏左侧的装饰性红、黄、绿三色圆形按钮
- **新增**：单一绿色最大化/还原按钮（28px × 28px，圆角 6px）
- **新增**：最大化时使用 `position: fixed` 覆盖整个视口，内容区 `max-width: 1200px` 居中显示
- **新增**：背景遮罩层（`backdrop-filter: blur(4px)`）模糊被覆盖区域
- **新增**：双击标题栏空白区域触发最大化/还原
- **新增**：按 `Esc` 键退出最大化状态
- **新增**：点击遮罩层触发还原

## Capabilities

### New Capabilities

- `sandbox-window-maximize`: 沙盒窗口最大化/还原功能，支持三种触发方式（按钮、双击标题栏、Esc 键），最大化时覆盖 TopActionBar 和左侧导航栏，内容区最大宽度 1200px 居中，适配不同尺寸显示器

### Modified Capabilities

- 无

## Impact

- **影响文件**：
  - `web/new-components/chat/content/ManusRightPanel.tsx` — 核心实现
  - `web/locales/zh/chat.ts` — 中文翻译新增
  - `web/locales/en/chat.ts` — 英文翻译新增
- **测试要求**：
  - 单元测试：验证最大化状态切换逻辑
  - E2E 测试：验证三种触发方式（按钮、双击、Esc）及遮罩层点击还原
- **安全检查**：遮罩层点击事件不穿透到被覆盖的页面元素