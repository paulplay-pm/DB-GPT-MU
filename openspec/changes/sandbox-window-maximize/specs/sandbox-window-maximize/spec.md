## ADDED Requirements

### Requirement: Maximize Button Display
沙盒窗口标题栏左侧 SHALL 显示单一的绿色最大化/还原按钮，尺寸 28px × 28px，圆角 6px。默认状态显示 `fa-expand` 图标（绿色 #22C55E），最大化状态显示 `fa-compress` 图标（绿色 #22C55E）。悬停时颜色变为深绿色（#16A34A），背景变为浅绿色（#F0FDF4），过渡动画 150ms。

### Requirement: Maximize Trigger via Button Click
当用户点击最大化按钮时，窗口 SHALL 立即切换为最大化状态：图标变为 `fa-compress`，Tooltip 更新为"还原"，窗口通过 CSS `position: fixed` 覆盖整个视口（`top:0; left:0; right:0; bottom:0`），圆角取消（`border-radius: 0`），层级提升至 `z-index: 9999`。背景显示半透明遮罩层（`rgba(0,0,0,0.3)` + `backdrop-filter: blur(4px)`），内容区最大宽度 1200px 居中显示。过渡动画时长 300ms，缓动函数 `cubic-bezier(0.4, 0, 0.2, 1)`。

### Requirement: Restore via Button Click
当窗口处于最大化状态时，用户点击收缩图标按钮，窗口 SHALL 还原到原始位置和尺寸：图标切换回 `fa-expand`，Tooltip 更新为"最大化"，窗口解除 `position: fixed`，圆角恢复（`border-radius: 12px`），层级恢复，遮罩层淡出隐藏。过渡动画时长 300ms。

### Requirement: Maximize Trigger via Double-Click on Title Bar
用户双击标题栏空白区域（按钮和工具栏区域除外）SHALL 触发最大化/还原切换。检测逻辑：排除 `onClick` 事件冒泡干扰，使用 300ms 防抖判断是否为双击。

### Requirement: Restore via Escape Key
当窗口处于最大化状态时，用户按 `Esc` 键 SHALL 触发还原操作。`Esc` 键仅在 `isMaximized === true` 时响应，非最大化状态下不响应。

### Requirement: Restore via Overlay Click
最大化状态下的遮罩层 SHALL 支持点击还原：用户点击遮罩层（`z-index: 9998`）SHALL 触发还原操作。遮罩层 `pointer-events: auto`，被覆盖元素 `pointer-events: none`，确保点击不透传到被覆盖的页面元素。

### Requirement: Scroll Position Management
窗口最大化时 SHALL 将页面滚动位置重置为顶部，还原时 SHALL 恢复原始滚动位置。需要记录 `window.scrollY` 状态。

### Requirement: Animation Performance
最大化/还原动画 SHALL 保证帧率 ≥ 60fps，使用 CSS `transform` 和 `opacity` 实现 GPU 加速。

### Requirement: Responsive Behavior
最大化状态 SHALL 自适应浏览器窗口尺寸变化，监听 `resize` 事件动态调整视口覆盖范围。

### Requirement: i18n Support
最大化按钮的 Tooltip SHALL 支持多语言，需要新增以下翻译 key：`maximize`（最大化）、`restore`（还原）。

### Requirement: Rapid Click Protection
通过状态锁防止重复触发：动画未完成时不响应新点击。状态锁使用 `isAnimating` 标志位控制。

---

#### Scenario: Button Click to Maximize
- **WHEN** 用户点击标题栏左侧的展开图标按钮
- **THEN** 图标立即切换为收缩图标，Tooltip 更新为"还原"，窗口以动画方式展开为全屏覆盖状态

#### Scenario: Button Click to Restore
- **WHEN** 窗口处于最大化状态时用户点击收缩图标按钮
- **THEN** 图标立即切换回展开图标，Tooltip 更新为"最大化"，窗口以动画方式缩回原始位置

#### Scenario: Double-Click Title Bar to Maximize
- **WHEN** 用户双击标题栏空白区域
- **THEN** 窗口切换为最大化状态，效果同点击最大化按钮

#### Scenario: Escape Key to Restore
- **WHEN** 窗口处于最大化状态时用户按 `Esc` 键
- **THEN** 窗口还原到原始位置和尺寸

#### Scenario: Overlay Click to Restore
- **WHEN** 窗口处于最大化状态时用户点击遮罩层
- **THEN** 窗口还原到原始位置和尺寸

#### Scenario: Rapid Click During Animation
- **WHEN** 最大化动画进行中用户再次点击按钮
- **THEN** 不响应新点击，状态锁防止重复触发

#### Scenario: Browser Resize While Maximized
- **WHEN** 浏览器窗口尺寸发生变化且窗口处于最大化状态
- **THEN** 窗口覆盖范围自动适应新的视口尺寸

#### Scenario: Scroll Position Reset on Maximize
- **WHEN** 用户点击最大化按钮
- **THEN** 页面滚动位置重置为顶部

#### Scenario: Scroll Position Restore on Restore
- **WHEN** 用户从最大化状态还原窗口
- **THEN** 页面滚动位置恢复到原始位置

#### Scenario: Maximize Tooltip in Chinese
- **WHEN** 用户语言设置为中文且鼠标悬停于最大化按钮
- **THEN** Tooltip 显示"最大化"

#### Scenario: Maximize Tooltip in English
- **WHEN** 用户语言设置为英文且鼠标悬停于最大化按钮
- **THEN** Tooltip 显示"Maximize"