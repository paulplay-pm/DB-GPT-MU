## Context

- **背景**：当前 `ManusRightPanel` 标题栏左侧有装饰性 macOS 红黄绿圆点按钮，无实际功能
- **现状**：最大化功能不存在，用户无法扩展右侧结果面板的工作区域
- **约束**：需兼容不同尺寸显示器（笔记本 13" 到外接 4K 显示器），最大化时内容区最大宽度 1200px 居中

## Goals / Non-Goals

**Goals:**
- 实现沙盒窗口最大化/还原功能，使用 `position: fixed` 覆盖 TopActionBar 和左侧导航栏
- 三种触发方式：按钮点击、双击标题栏空白区、Esc 键
- 点击遮罩层还原
- 平滑过渡动画（300ms）
- i18n 支持（tooltip 多语言）

**Non-Goals:**
- 不实现浏览器原生全屏（`requestFullscreen()` API）
- 不改造左侧面板或其他区域的最大化
- 不实现拖拽调整窗口大小

## Decisions

### 1. 采用 CSS `position: fixed` 而非 `requestFullscreen()`

**决策**：最大化时使用 `position: fixed; z-index: 9999; top:0; left:0; right:0; bottom:0`

**理由**：
- 浏览器原生全屏会隐藏地址栏、标签栏等所有浏览器 UI，不符合 PRD 要求的"覆盖 TopActionBar + 导航栏但保持浏览器窗口完整"
- `position: fixed` 可精确控制覆盖范围，遮罩层 `z-index: 9998` 实现背景模糊
- 自动适配所有显示器尺寸，`top/left/right/bottom: 0` 填满视口

### 2. 最大化按钮替换 macOS 三色圆点

**决策**：移除红黄绿装饰性圆点，新增单一绿色 `fa-expand` / `fa-compress` 图标按钮

**理由**：
- PRD 明确要求移除原有按钮
- 单按钮设计更简洁，符合现代 UI 趋势
- 图标切换直观表达当前状态（展开/收缩）

### 3. 状态管理方案

**决策**：`ManusRightPanel` 内部通过 `useState` 管理 `isMaximized` 状态

**理由**：
- 最大化状态仅影响本组件，无需提升到父组件（`index.tsx`）
- 减少不必要的 prop drilling
- 组件自包含，符合单一职责原则

### 4. 遮罩层实现

**决策**：在组件根部渲染遮罩层 div，监听 `onClick` 触发还原

**理由**：
- 遮罩层 `z-index: 9998` + `backdrop-filter: blur(4px)` 实现 PRD 要求的模糊效果
- 点击事件绑定在遮罩层而非 ` ManusRightPanel` 上，避免点击面板内容触发误还原
- 遮罩层 `pointer-events: auto`，被覆盖元素 `pointer-events: none`

### 5. 动画实现

**决策**：使用 CSS `transition` 配合条件类名

**理由**：
- `transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)` 实现平滑动画
- GPU 加速（`transform`, `opacity`）保证 60fps
- 避免 JavaScript 动画性能问题
- 类名切换比行内 style 动画更可控

### 6. 双击标题栏触发

**决策**：在标题栏根 div 上绑定 `onDoubleClick`，排除按钮和工具栏区域

**理由**：
- 双击空白区域才触发，排除误触
- 按钮本身的 `onClick` 不冒泡影响双击判断
- 使用 `e.target` 检测点击区域是否在工具栏内

## Risks / Trade-offs

| 风险 | 说明 | 缓解措施 |
|------|------|---------|
| z-index 冲突 | 其他弹窗/浮层可能使用相同 z-index | 使用 9999/9998 确保最高，发布前检查全站 z-index |
| 固定定位导致布局抖动 | 某些场景下 fixed 元素可能影响页面 reflow | 遮罩层异步渲染，动画完成前不阻塞主线程 |
| Esc 键全局冲突 | 用户使用 Esc 中断其他操作时意外退出最大化 | Esc 仅在 `isMaximized === true` 时响应 |
| i18n 遗漏 | 新增 key 可能遗漏部分语言 | 同步更新 zh/en 翻译文件 |

## Migration Plan

1. **开发阶段**：在 `ManusRightPanel.tsx` 内部实现，不影响其他组件
2. **翻译文件**：同步更新 `web/locales/zh/chat.ts` 和 `web/locales/en/chat.ts`
3. **测试阶段**：手工测试多尺寸显示器（1366×768 到 3840×2160）
4. **上线**：功能开关默认开启，无需灰度

## Open Questions

- 双击标题栏的检测逻辑是否会产生误触（比如用户快速点击两次而非双击）？
  - 解决：使用 `click` 计数器 + 300ms 防抖判断是否为双击
- 最大化状态下，页面滚动位置是否需要重置？
  - 按 PRD：最大化时滚动位置重置为顶部，还原时恢复原滚动位置
  - 需记录 `window.scrollY` 状态