# 首页布局优化任务清单

## 1. i18n 国际化

- [ ] 1.1 在 `web/locales/zh/common.ts` 新增 `home_slogan: '开口问数，看见洞察'`
- [ ] 1.2 在 `web/locales/en/common.ts` 新增 `home_slogan: 'Ask Data, See Insights'`
- [ ] 1.3 规范校验：`grep -r "home_slogan" web/locales/` 确认所有语言文件已更新

## 2. Welcome Mode 区域重构

- [ ] 2.1 修改 `web/pages/index.tsx` Welcome Mode 容器样式
  - 移除 `justify-center`，改为顶部 padding `pt-8`
  - 调整 `px-6 py-4` → `px-6 py-8`
- [ ] 2.2 删除顶部大型 title（lines ~2843-2848）：Logo + "DB-GPT AI数据助理"
- [ ] 2.3 删除顶部 subtitle（line ~2850-2852）："Agentic Data Driven Decisions"
- [ ] 2.4 在 title 位置添加简化 slogan：`t('home_slogan')`
  - 样式：`text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-200 mb-6 text-center`
- [ ] 2.5 规范校验清单：i18n key 存在、样式符合设计规范

## 3. 卡片区域重构

- [ ] 3.1 修改卡片网格布局
  - 从 `grid-cols-1 sm:grid-cols-2 gap-3` 改为 `grid-cols-2 lg:grid-cols-4 gap-4`
- [ ] 3.2 为每张卡片添加顶部渐变色条
  - 新增包装元素：`overflow-hidden rounded-2xl`
  - 渐变色条：`h-2 w-full bg-gradient-to-r [colors]`
- [ ] 3.3 移除 "推荐示例" 分隔标题区域（lines ~3439-3445）
- [ ] 3.4 调整卡片内部 padding：从 `p-4` 保持不变
- [ ] 3.5 规范校验清单：渐变色正确、间距符合设计

## 4. 输入框位置确认

- [ ] 4.1 确认输入框位于 DOM 最后位置（自然底部）
- [ ] 4.2 确认 `pb-20` 底部 padding 足够（防止内容被底部导航遮挡）
- [ ] 4.3 规范校验清单：输入框交互正常、placeholder 显示正确

## 5. 验证与回归

- [ ] 5.1 运行 `yarn lint` 无 ESLint 错误
- [ ] 5.2 运行 `yarn build` 构建成功
- [ ] 5.3 移动端响应式验证：卡片 2x2 布局正常
- [ ] 5.4 桌面端布局验证：卡片 4 列布局正常
- [ ] 5.5 暗色模式验证：渐变色条、文字颜色正确
- [ ] 5.6 视觉回归：截图对比 Image #4 优化效果

## 任务依赖关系

```
1.1, 1.2, 1.3 (i18n)
        ↓
2.1 → 2.2 → 2.3 → 2.4 → 2.5
        ↓
3.1 → 3.2 → 3.3 → 3.4 → 3.5
        ↓
4.1 → 4.2 → 4.3
        ↓
5.1 → 5.2 → 5.3 → 5.4 → 5.5 → 5.6
```

## 编码规范

- React 组件使用 TypeScript 严格模式
- 所有用户可见文本使用 `t()` i18n key
- Tailwind CSS 类名保持现有风格
- 渐变色使用 Tailwind 内置渐变类（`bg-gradient-to-r`）
- 响应式断点遵循现有配置（`sm:`, `lg:`）
