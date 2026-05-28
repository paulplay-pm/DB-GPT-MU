# 首页布局 V2 设计

## 布局结构

```
目标布局
══════════════════════════════════

┌─────────────────────────────────────┐
│                                     │
│     开口问数，看见洞察              │  ← slogan 在上半部分空白区域中心
│                                     │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐      │  ← cards
│   ┌────────────────────────┐       │
│   │      Input Box          │       │  ← input box 固定在最底部
│   └────────────────────────┘       │
└─────────────────────────────────────┘
```

## 实现方案

### 1. Flex 布局调整

**当前 (Welcome Mode 外层):**
```tsx
<div className='flex-1 flex flex-col items-center px-6 py-8 pb-20 overflow-y-auto'>
  <div className='w-full max-w-[860px] flex flex-col items-center animate-fade-in-up'>
```

**目标:**
```tsx
<div className='flex-1 flex flex-col items-center px-6 py-8 pb-20 overflow-y-auto justify-between'>
  <div className='w-full max-w-[860px] flex flex-col items-center animate-fade-in-up flex-1'>
```

变化:
- 外层添加 `justify-between` → 内容分布到顶底
- 内层添加 `flex-1` → slogan+cards 占据中间所有空间，slogan 自动垂直居中于剩余空间

### 2. 工具栏恢复

恢复被 Task 5 删除的 Dropdown + Skill Popover 组件:

```tsx
{/* 工具栏 - 左侧: Dropdown */}
<div className='flex items-center gap-4'>
  <Dropdown
    menu={{
      items: [
        {
          key: 'upload',
          label: <Upload {...uploadProps}><div>{t('add_from_local')}</div></Upload>,
          icon: <PaperClipOutlined />,
        },
        {
          key: 'skill',
          label: t('use_skill'),
          icon: <ThunderboltOutlined />,
          onClick: () => setIsSkillPanelOpen(true),
        },
        {
          key: 'knowledge',
          label: t('use_knowledge'),
          icon: <BookOutlined />,
          onClick: () => setIsKnowledgePanelOpen(true),
        },
        {
          key: 'database',
          label: t('use_database'),
          icon: <DatabaseOutlined />,
          onClick: () => setIsDbPanelOpen(true),
        },
      ],
    }}
    trigger={['click']}
  >
    <Tooltip title={t('add_context')}>
      <Button type='text' shape='circle' size='small' icon={<PlusOutlined />} ... />
    </Tooltip>
  </Dropdown>

  {/* Skill Selector Popover */}
  <Popover trigger='click' ... content={<SkillPopover />} >
    ...
  </Popover>
</div>
```

状态变量:
- `isSkillPanelOpen` / `setIsSkillPanelOpen` — 恢复使用（当前是 `_isSkillPanelOpen`）
- `isKnowledgePanelOpen` / `setIsKnowledgePanelOpen` — 恢复使用（当前是 `_isKnowledgePanelOpen`）
- `isDbPanelOpen` / `setIsDbPanelOpen` — 恢复使用（当前是 `_isDbPanelOpen`）

### 3. 发送按钮

保持 Task 5 的紫色方形样式:
```tsx
<div className='w-9 h-9 rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center text-white transition-colors'>
  <ArrowUpOutlined />
</div>
```

## 编码规范

- 遵循现有组件模式
- Dropdown 使用 `trigger={['click']}`
- Skill Popover 保持原有的 `overlayClassName='manus-skill-menu'`
- 状态变量 underscore 前缀移除