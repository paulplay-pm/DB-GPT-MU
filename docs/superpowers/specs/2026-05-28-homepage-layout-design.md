# 首页布局优化设计

## 概述

优化 DB-GPT 首页（`pages/index.tsx`）的布局，参考 Image #7 交互风格：卡片上移至输入框上方，输入框固定底部，视觉更紧凑。

## 布局结构对比

```
CURRENT LAYOUT                              TARGET LAYOUT
═══════════════════════════════════════════  ════════════════════════════════════

┌────────────────────────────────┐          ┌────────────────────────────────┐
│ [Logo] DB-GPT AI数据助理       │          │     开口问数，看见洞察           │  ← 简化 slogan
│  Agentic Data Driven Decisions │          │                                │
├────────────────────────────────┤          ├────────────────────────────────┤
│                                │          │  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│      ┌──────────────────┐      │          │  │blue│ │green│ │purple│ │amber│ │  ← 渐变色条
│      │   Input Box      │      │          │  └────┘ └────┘ └────┘ └────┘   │  ← 卡片移至上方
│      └──────────────────┘      │          │                                │
│   ─────── 推荐示例 ───────      │          │  ┌────────────────────────┐     │
│   ┌────────┐  ┌────────┐       │          │  │      Input Box         │     │  ← 输入框保持底部
│   │  Card  │  │  Card  │       │          │  └────────────────────────┘     │
│   └────────┘  └────────┘       │          │                                │
│   ┌────────┐  ┌────────┐       │          │                                │
│   │  Card  │  │  Card  │       │          │                                │
│   └────────┘  └────────┘       │          │                                │
└────────────────────────────────┘          └────────────────────────────────┘
```

## 视觉设计

### 1. Slogan 区域

| 属性 | 值 |
|------|-----|
| 文字 | `t('home_slogan')` |
| 字号 | 24px / 移动端 20px (`text-2xl md:text-3xl`) |
| 字重 | 500 (font-medium) |
| 颜色 | `text-gray-700 dark:text-gray-200` |
| 间距 | `mb-6` (24px) |
| 对齐 | 居中 (text-center) |

### 2. 卡片网格

| 属性 | 当前值 | 目标值 |
|------|--------|--------|
| 移动端 | `grid-cols-1 sm:grid-cols-2` | `grid-cols-2` |
| 桌面端 | 2列 | `lg:grid-cols-4` (4列) |
| 间距 | `gap-3` (12px) | `gap-4` (16px) |

### 3. 卡片渐变色条

每张卡片顶部新增 8px 高度渐变色条：

| 卡片 ID | 渐变色 (Tailwind) |
|---------|-------------------|
| walmart_sales | `from-blue-500 to-cyan-400` |
| db_profile_report | `from-emerald-500 to-teal-400` |
| fin_report | `from-violet-500 to-purple-400` |
| create_sql_skill | `from-amber-500 to-orange-400` |

### 4. 响应式断点

```
移动端 (< 768px):  grid-cols-2, gap-3
平板 (768-1024px): grid-cols-2, gap-4
桌面 (> 1024px):   grid-cols-4, gap-4
```

## 代码修改

### i18n 新增

**`web/locales/zh/common.ts`**:
```ts
home_slogan: '开口问数，看见洞察',
```

**`web/locales/en/common.ts`**:
```ts
home_slogan: 'Ask Data, See Insights',
```

### `web/pages/index.tsx` 修改

#### Welcome Mode 容器 (lines ~2841-2852)

**当前**:
```tsx
<div className="flex-1 flex flex-col items-center justify-center px-6 py-4 pb-20 overflow-y-auto">
  <h1 className="text-4xl md:text-5xl font-serif ...">
    <Image src="/LOGO_SMALL.png" ... />
    {t('home_title')}
  </h1>
  <p className="text-sm ... tracking-[0.2em] ...">
    {t('home_subtitle')}
  </p>
```

**目标**:
```tsx
<div className="flex-1 flex flex-col items-center px-6 py-8 pb-20 overflow-y-auto">
  <h2 className="text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200 mb-6 text-center">
    {t('home_slogan')}
  </h2>
```

#### 卡片网格 (lines ~3438-3482)

**当前**:
```tsx
<div className="mt-10 w-full">
  <div className="flex items-center justify-center gap-2 mb-4">
    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200 ..." />
    <span className="text-xs font-medium text-gray-400 ... uppercase">
      {t('recommend_examples')}
    </span>
    ...
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {EXAMPLE_CARDS.map(example => (
      <div className={`group relative bg-gradient-to-br ${example.color} ...`}>
        ...
      </div>
    ))}
  </div>
</div>
```

**目标**:
```tsx
<div className="w-full mb-8">
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    {EXAMPLE_CARDS.map(example => (
      <div className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${example.color} ...`}>
        {/* 渐变色条 */}
        <div className={`h-2 w-full bg-gradient-to-r ${example.gradientColors}`} />
        {/* 卡片内容 */}
        <div className="p-4">
          ...
        </div>
      </div>
    ))}
  </div>
</div>
```

#### EXAMPLE_CARDS 数据结构

新增 `gradientColors` 字段：

```ts
const EXAMPLE_CARDS = [
  {
    id: 'walmart_sales',
    gradientColors: 'from-blue-500 to-cyan-400',
    // ... 现有字段
  },
  // ...
];
```

## 实施任务

1. i18n 新增 `home_slogan` 翻译 key
2. Welcome Mode 容器样式调整
3. 删除大型 title + subtitle，添加简化 slogan
4. 卡片网格改为响应式 2x2 / 4 列
5. 移除 "推荐示例" 分隔标题
6. 为每张卡片添加渐变色条
7. 构建验证

## 编码规范

- React 组件使用 TypeScript 严格模式
- 所有用户可见文本使用 `t()` i18n key
- Tailwind CSS 类名保持现有风格
- 渐变色使用 Tailwind 内置渐变类（`bg-gradient-to-r`）
- 响应式断点遵循现有配置（`sm:`, `lg:`）
