# 首页布局优化设计

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
│      │                  │      │          │                                │
│      └──────────────────┘      │          │  ┌────────────────────────┐     │
│                                │          │  │      Input Box         │     │  ← 输入框保持底部
│   ─────── 推荐示例 ───────      │          │  └────────────────────────┘     │
│   ┌────────┐  ┌────────┐       │          │                                │
│   │  Card  │  │  Card  │       │          │                                │
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
| 字号 | 24px / 移动端 20px |
| 字重 | 500 (medium) |
| 颜色 | `#374151` (gray-700) |
| 间距 | 底部 margin-bottom: 24px |
| 对齐 | 居中 |

### 2. 卡片网格

| 属性 | 当前值 | 目标值 |
|------|--------|--------|
| 移动端 | `grid-cols-1 sm:grid-cols-2` | `grid-cols-2` (始终2列) |
| 桌面端 | 2列 | `lg:grid-cols-4` (4列) |
| 列间距 | `gap-3` (12px) | `gap-4` (16px) |
| 行间距 | `gap-3` | `gap-4` |

### 3. 卡片渐变色条

每张卡片顶部新增 8px 高度渐变色条：

| 卡片 | 渐变色 |
|------|--------|
| 沃尔玛销售数据分析 | `linear-gradient(135deg, #3b82f6, #60a5fa)` (蓝色) |
| 数据库画像与分析报告 | `linear-gradient(135deg, #10b981, #34d399)` (绿色) |
| 金融财报深度分析 | `linear-gradient(135deg, #8b5cf6, #a78bfa)` (紫色) |
| 创建SQL分析技能 | `linear-gradient(135deg, #f59e0b, #fbbf24)` (橙色) |

渐变色条位置：`border-radius` 应用于卡片容器，渐变条在顶部。

### 4. 响应式断点

```
移动端 (< 768px):  grid-cols-2, gap-3
平板 (768-1024px): grid-cols-2, gap-4
桌面 (> 1024px):   grid-cols-4, gap-4
```

## 代码修改点

### `web/pages/index.tsx`

**Welcome Mode 区域（lines ~2840-3485）**

```tsx
// 当前结构（简化）
<div className="flex-1 flex flex-col items-center justify-center px-6 py-4 pb-20 overflow-y-auto">
  <h1>DB-GPT AI数据助理</h1>           // 删除
  <p>Agentic Data Driven Decisions</p>   // 删除
  <InputBox />                           // 下移
  <Cards />                              // 上移
</div>

// 目标结构
<div className="flex-1 flex flex-col items-center px-6 py-8 pb-20 overflow-y-auto">
  <h2>开口问数，看见洞察</h2>            // 新增
  <Cards />                              // 上移（DOM 顺序调整）
  <InputBox />                           // 保持底部
</div>
```

**卡片渲染区域（lines ~3446-3482）**

```tsx
// 当前
<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  {EXAMPLE_CARDS.map(...)}
</div>

// 目标
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {EXAMPLE_CARDS.map(example => (
    <div className={`rounded-2xl overflow-hidden ...`}>
      {/* 渐变色条 */}
      <div className={`h-2 bg-gradient-to-r ${example.gradientColors}`} />
      {/* 卡片内容 */}
      <div className="p-4">...</div>
    </div>
  ))}
</div>
```

### `web/locales/zh/common.ts`

```ts
home_slogan: '开口问数，看见洞察',
```

### `web/locales/en/common.ts`

```ts
home_slogan: 'Ask Data, See Insights',
```

## EXAMPLE_CARDS 数据结构扩展

建议在 `EXAMPLE_CARDS` 中新增 `gradientColors` 字段：

```ts
{
  id: 'walmart_sales',
  gradientColors: 'from-blue-500 to-cyan-400',
  // ... 现有字段
}
```

或者直接在渲染时根据 `color` 字段推断。

## 测试数据构造

```json
{
  "home_slogan_zh": "开口问数，看见洞察",
  "home_slogan_en": "Ask Data, See Insights",
  "cards": [
    { "id": "walmart_sales", "gradient": "blue" },
    { "id": "db_profile_report", "gradient": "emerald" },
    { "id": "fin_report", "gradient": "violet" },
    { "id": "create_sql_skill", "gradient": "amber" }
  ]
}
```

## CI 校验流程

1. ESLint 检查：`yarn lint`
2. 类型检查：`yarn tsc --noEmit`
3. 构建验证：`yarn build`
4. 视觉回归（可选）：截图工具对比优化前后
