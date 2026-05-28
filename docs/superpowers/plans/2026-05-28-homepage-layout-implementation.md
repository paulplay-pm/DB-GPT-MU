# 首页布局优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化首页布局 - 卡片上移至输入框上方，添加简化 slogan 和卡片渐变色条

**Architecture:** 仅修改 `web/pages/index.tsx` 和 i18n 文件，保持功能逻辑不变

**Tech Stack:** React, TypeScript, Tailwind CSS, Next.js

---

## 文件结构

- 修改: `web/locales/zh/common.ts` - 新增 `home_slogan` 翻译
- 修改: `web/locales/en/common.ts` - 新增 `home_slogan` 翻译
- 修改: `web/pages/index.tsx` - Welcome Mode 区域重构

---

## Task 1: i18n 国际化

**Files:**
- Modify: `web/locales/zh/common.ts:459`
- Modify: `web/locales/en/common.ts:457`

- [ ] **Step 1: 在中文 i18n 添加 home_slogan**

文件: `web/locales/zh/common.ts`

在 `home_title` (line 460) 附近添加:
```ts
home_slogan: '开口问数，看见洞察',
```

- [ ] **Step 2: 在英文 i18n 添加 home_slogan**

文件: `web/locales/en/common.ts`

在 `home_title` (line 457) 附近添加:
```ts
home_slogan: 'Ask Data, See Insights',
```

- [ ] **Step 3: Commit i18n changes**

```bash
git add web/locales/zh/common.ts web/locales/en/common.ts
git commit -m "feat(i18n): add home_slogan translation key

ZH: 开口问数，看见洞察
EN: Ask Data, See Insights"
```

---

## Task 2: Welcome Mode 容器样式调整

**Files:**
- Modify: `web/pages/index.tsx:2841`

- [ ] **Step 1: 修改 Welcome Mode 容器样式**

当前 (line 2841):
```tsx
<div className='flex-1 flex flex-col items-center justify-center px-6 py-4 pb-20 overflow-y-auto'>
```

改为:
```tsx
<div className='flex-1 flex flex-col items-center px-6 py-8 pb-20 overflow-y-auto'>
```

变化:
- 移除 `justify-center` → 内容从垂直居中改为顶部对齐
- `py-4` → `py-8` → 增加顶部间距

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): adjust Welcome Mode container padding"
```

---

## Task 3: 替换大型 Title + Subtitle 为简化 Slogan

**Files:**
- Modify: `web/pages/index.tsx:2843-2852`

- [ ] **Step 1: 删除 h1 title 和 p subtitle**

当前 (lines 2843-2852):
```tsx
<h1 className='text-4xl md:text-5xl font-serif text-gray-900 dark:text-gray-100 mb-4 text-center flex items-center gap-4'>
  <div className='w-12 h-12 rounded-xl bg-white dark:bg-[#1a1b1e] shadow-md flex items-center justify-center flex-shrink-0'>
    <Image src='/LOGO_SMALL.png' alt='DB-GPT' width={32} height={32} className='object-contain' />
  </div>
  {t('home_title')}
</h1>

<p className='text-sm md:text-base text-gray-400 dark:text-gray-500 tracking-[0.2em] font-light mb-10'>
  {t('home_subtitle')}
</p>
```

替换为:
```tsx
<h2 className='text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200 mb-6 text-center'>
  {t('home_slogan')}
</h2>
```

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): replace large title with simplified slogan"
```

---

## Task 4: 重排 DOM 顺序 - 输入框移至卡片下方

**Files:**
- Modify: `web/pages/index.tsx:2854-2940` (Input Box)
- Modify: `web/pages/index.tsx:3437-3480` (Cards)

**关键**: 需要将 Input Box 的 DOM 移动到 Cards 的下方

- [ ] **Step 1: 找到 Input Box 区域的结束位置**

Input Box 开始于 line 2854，结束于 Cards 区域开始前 (约 line 3436)

- [ ] **Step 2: 找到 Cards 区域的结束位置**

Cards 区域开始于 line 3437，结束于约 line 3480

- [ ] **Step 3: 交换 DOM 顺序**

当前顺序:
```
...
<h2 className='...slogan...' />
<InputBox />          {/* lines ~2854-3436 */}
<Cards />             {/* lines ~3437-3480 */}
</div>
```

目标顺序:
```
...
<h2 className='...slogan...' />
<Cards />             {/* lines ~3437-3480 */}
<InputBox />          {/* lines ~2854-3436 */}
</div>
```

**具体操作**:
1. 将 lines ~2854-3436 (Input Box div) 移动到 Cards div 之后
2. 将 lines ~3437-3480 (Cards div) 移动到 Input Box div 之前

- [ ] **Step 4: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): reorder DOM - cards above input box"
```

---

## Task 5: 修改卡片网格布局

**Files:**
- Modify: `web/pages/index.tsx:3437-3448`

- [ ] **Step 1: 修改卡片网格 class**

当前 (line 3446):
```tsx
<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
```

改为:
```tsx
<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
```

变化:
- `grid-cols-1 sm:grid-cols-2` → `grid-cols-2 lg:grid-cols-4`
- `gap-3` → `gap-4`

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): update card grid to responsive 2x2/4 columns"
```

---

## Task 6: 移除 "推荐示例" 分隔标题

**Files:**
- Modify: `web/pages/index.tsx:3438-3445`

- [ ] **Step 1: 删除分隔标题区域**

当前 (lines 3438-3445):
```tsx
{/* Recommended Examples */}
<div className='mt-10 w-full'>
  <div className='flex items-center justify-center gap-2 mb-4'>
    <div className='h-px flex-1 bg-gradient-to-r from-transparent to-gray-200 dark:to-gray-700' />
    <span className='text-xs font-medium text-gray-400 dark:text-gray-500 tracking-wider uppercase'>
      {t('recommend_examples')}
    </span>
    <div className='h-px flex-1 bg-gradient-to-l from-transparent to-gray-200 dark:to-gray-700' />
  </div>
```

删除这些行。

同时修改外层 div:
当前: `<div className='mt-10 w-full'>`
改为: `<div className='w-full'>`

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): remove recommend_examples section divider"
```

---

## Task 7: 为 EXAMPLE_CARDS 添加渐变色字段

**Files:**
- Modify: `web/pages/index.tsx:429-484` (EXAMPLE_CARDS 定义)

- [ ] **Step 1: 为每张卡片添加 gradientColors 字段**

在 `EXAMPLE_CARDS` 定义中，为每张卡片添加 `gradientColors` 字段:

```ts
const EXAMPLE_CARDS = [
  {
    id: 'walmart_sales',
    gradientColors: 'from-blue-500 to-cyan-400',
    // ... 现有字段
  },
  {
    id: 'db_profile_report',
    gradientColors: 'from-emerald-500 to-teal-400',
    // ... 现有字段
  },
  {
    id: 'fin_report',
    gradientColors: 'from-violet-500 to-purple-400',
    // ... 现有字段
  },
  {
    id: 'create_sql_skill',
    gradientColors: 'from-amber-500 to-orange-400',
    // ... 现有字段
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): add gradientColors to EXAMPLE_CARDS"
```

---

## Task 8: 为卡片添加渐变色条

**Files:**
- Modify: `web/pages/index.tsx:3448-3479` (卡片渲染)

- [ ] **Step 1: 修改卡片结构，添加渐变色条**

当前卡片结构:
```tsx
<div
  key={example.id}
  onClick={() => handleExampleClick(example)}
  className={`group relative bg-gradient-to-br ${example.color} border ${example.borderColor} rounded-2xl p-4 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
>
  <div className='flex items-start gap-3'>
    ...
  </div>
  <div className='absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity'>
    <RightOutlined className='text-xs text-gray-400' />
  </div>
</div>
```

替换为:
```tsx
<div
  key={example.id}
  onClick={() => handleExampleClick(example)}
  className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${example.color} border ${example.borderColor} cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
>
  {/* 渐变色条 */}
  <div className={`h-2 w-full bg-gradient-to-r ${example.gradientColors}`} />
  {/* 卡片内容 */}
  <div className='p-4'>
    <div className='flex items-start gap-3'>
      <div
        className={`w-10 h-10 ${example.iconBg} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}
      >
        {example.icon}
      </div>
      <div className='flex-1 min-w-0'>
        <h3 className='text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1'>
          {(() => {
            const key = `example_${example.id}_title`;
            const val = t(key) as string;
            return val && val !== key ? val : example.title;
          })()}
        </h3>
        <p className='text-xs text-gray-500 dark:text-gray-400 line-clamp-2'>
          {(() => {
            const key = `example_${example.id}_desc`;
            const val = t(key) as string;
            return val && val !== key ? val : example.description;
          })()}
        </p>
      </div>
    </div>
    <div className='absolute top-6 right-4 opacity-0 group-hover:opacity-100 transition-opacity'>
      <RightOutlined className='text-xs text-gray-400' />
    </div>
  </div>
</div>
```

**关键变化**:
- 外层添加 `overflow-hidden`
- 移除外层 `p-4`，内层添加 `<div className='p-4'>`
- 添加 `<div className={`h-2 w-full bg-gradient-to-r ${example.gradientColors}`} />`
- 调整 `top-4 right-4` 为 `top-6 right-4` (因为渐变条增加了高度)

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): add gradient color bars to example cards"
```

---

## Task 9: 构建验证

**Files:**
- None (验证步骤)

- [ ] **Step 1: 运行 ESLint 检查**

```bash
cd web && yarn lint 2>&1 | head -30
```

预期: 无 ESLint 错误

- [ ] **Step 2: 运行构建**

```bash
cd web && yarn build 2>&1 | tail -30
```

预期: 构建成功

- [ ] **Step 3: Commit 所有剩余更改**

如果所有验证通过:
```bash
git add -A
git commit -m "feat(homepage): implement layout optimization per design spec"
```

---

## 任务依赖关系

```
Task 1 (i18n) ─────────────────────────────────────┐
                                                     ↓
Task 2 (Container style) ───────────────────────────┤
                                                     ↓
Task 3 (Title → Slogan) ────────────────────────────┤
                                                     ↓
Task 4 (Reorder DOM) ───────────────────────────────┤
                                                     ↓
Task 5 (Card grid) ─────────────────────────────────┤
                                                     ↓
Task 6 (Remove divider) ────────────────────────────┤
                                                     ↓
Task 7 (gradientColors field) ──────────────────────┤
                                                     ↓
Task 8 (Add gradient bars) ────────────────────────┤
                                                     ↓
Task 9 (Build verification)
```

## 编码规范

- React 组件使用 TypeScript 严格模式
- 所有用户可见文本使用 `t()` i18n key
- Tailwind CSS 类名保持现有风格
- 渐变色使用 Tailwind 内置渐变类（`bg-gradient-to-r`）
- 响应式断点遵循现有配置（`sm:`, `lg:`）
- 每次 Task 完成后立即 commit
