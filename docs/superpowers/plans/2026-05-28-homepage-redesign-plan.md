# 首页布局优化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 参考 Image #10 风格重构首页欢迎模式区域 — 白底卡片+细边框、收紧间距、输入框底部固定

**Architecture:** 仅修改 `web/pages/index.tsx` 欢迎模式区域，保持功能逻辑不变

**Tech Stack:** React, TypeScript, Tailwind CSS, Next.js

---

## 文件结构

- Modify: `web/pages/index.tsx:2844-2892` (卡片区域)
- Modify: `web/pages/index.tsx:2894-2950` (输入框区域)

---

## Task 1: 卡片样式重构 — 白底+细边框

**Files:**
- Modify: `web/pages/index.tsx:2850-2892`

- [ ] **Step 1: 修改卡片外层 div**

当前 (line 2853-2856):
```tsx
<div
  key={example.id}
  onClick={() => handleExampleClick(example)}
  className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${example.color} border ${example.borderColor} cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
>
```

替换为:
```tsx
<div
  key={example.id}
  onClick={() => handleExampleClick(example)}
  className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 dark:border-gray-800 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
>
```

变化:
- 移除 `bg-gradient-to-br ${example.color}` → `bg-white`
- 移除 `${example.borderColor}` → `border-gray-100 dark:border-gray-800`
- `hover:shadow-lg` → `hover:shadow-md`

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): change cards to white bg with subtle border"
```

---

## Task 2: 调整卡片网格间距

**Files:**
- Modify: `web/pages/index.tsx:2851`

- [ ] **Step 1: 修改 grid gap**

当前 (line 2851):
```tsx
<div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
```

改为:
```tsx
<div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
```

变化: `gap-3` → `gap-4` (12px → 16px)

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): increase card grid gap to 16px"
```

---

## Task 3: 收紧 slogan 底部间距

**Files:**
- Modify: `web/pages/index.tsx:2846`

- [ ] **Step 1: 修改 slogan margin**

当前 (line 2846):
```tsx
<h2 className='text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200 mb-4 text-center'>
```

改为:
```tsx
<h2 className='text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200 mb-3 text-center'>
```

变化: `mb-4` → `mb-3` (16px → 12px)

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): reduce slogan bottom margin to 12px"
```

---

## Task 4: 输入框高度收紧

**Files:**
- Modify: `web/pages/index.tsx:2894-2900`

- [ ] **Step 1: 修改输入框容器样式**

当前 (lines 2894-2899):
```tsx
{/* Input Box Container - Premium Layered Style */}
<div className='w-full relative'>
  {/* Outer Frame - Floating Effect */}
  <div className='w-full relative transition-all duration-500 rounded-[28px] shadow-[0_16px_48px_rgba(0,0,0,0.12),0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_24px_64px_rgba(0,0,0,0.2),0_12px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_24px_64px_rgba(0,0,0,0.5)]'>
    {/* White Inner Box - Clean Glass Card */}
    <div className='bg-white/95 backdrop-blur-md dark:bg-[#1e1f24]/95 rounded-[28px] border border-gray-100 dark:border-[#33353b] shadow-[inset_0_1px_0_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] p-5 relative z-10'>
```

替换为:
```tsx
{/* Input Box Container */}
<div className='w-full relative'>
  {/* Outer Frame */}
  <div className='w-full relative transition-all duration-300 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1e1f24] shadow-sm hover:shadow-md'>
    {/* Inner Box */}
    <div className='p-3 relative z-10'>
```

变化:
- 移除 `rounded-[28px]` → `rounded-xl`
- 移除多层复杂阴影 → `shadow-sm hover:shadow-md`
- 移除 `backdrop-blur-md` 和透明度 → `bg-white`
- 移除内层 `shadow-[inset_0_1px_0_rgba(255,255,255,1)]`
- 移除 `border border-gray-100 dark:border-[#33353b]`
- `p-5` → `p-3`

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): tighten input box height and simplify styling"
```

---

## Task 5: 底部工具栏布局精简

**Files:**
- Modify: `web/pages/index.tsx` (底部工具栏区域，约 line 2920-2960)

- [ ] **Step 1: 找到底部工具栏位置**

工具栏位于输入框内层 div (`p-3`) 中，包含:
- 左侧: 上传文件、快捷方式、列表、文件夹图标
- 中间: 模型选择器
- 右侧: 麦克风、发送按钮

- [ ] **Step 2: 精简左侧图标**

当前左侧可能有 4 个图标，改为 2 个（上传、布局设置）:
```tsx
{/* 左侧工具图标 */}
<div className='flex items-center gap-2'>
  <Tooltip title={t('upload')}>
    <div className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'>
      <PaperClipOutlined />
    </div>
  </Tooltip>
  <Tooltip title={t('layout')}>
    <div className='w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'>
      <AppstoreOutlined />
    </div>
  </Tooltip>
</div>
```

- [ ] **Step 3: 调整发送按钮样式**

发送按钮从灰色圆形改为紫色方形:
```tsx
<div className='w-9 h-9 rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center text-white transition-colors'>
  <ArrowUpOutlined />
</div>
```

- [ ] **Step 4: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): simplify bottom toolbar icons and update send button"
```

---

## Task 6: 构建验证

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

- [ ] **Step 3: Commit 所有验证通过**

```bash
git add -A
git commit -m "feat(homepage): implement Image #10 style redesign"
```

---

## 任务依赖关系

```
Task 1 (Card style) ─────────────────────────────────┐
                                                         ↓
Task 2 (Card gap) ─────────────────────────────────────┤
                                                         ↓
Task 3 (Slogan margin) ────────────────────────────────┤
                                                         ↓
Task 4 (Input box) ───────────────────────────────────┤
                                                         ↓
Task 5 (Toolbar) ─────────────────────────────────────┤
                                                         ↓
Task 6 (Build verification)
```

## 编码规范

- React 组件使用 TypeScript 严格模式
- Tailwind CSS 遵循现有设计系统
- 暗色模式: `dark:bg-[#1e1f24]`, `dark:border-gray-800`
- 每次 Task 完成后立即 commit
- 保持现有功能逻辑不变