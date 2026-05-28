# 首页布局 V2 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 恢复工具栏 + 固定对话框在底部 + slogan 居中于空白区域

**Architecture:** 修改 `web/pages/index.tsx` Welcome Mode 区域布局和工具栏组件

**Tech Stack:** React, TypeScript, Tailwind CSS, Next.js

---

## Task 1: 恢复状态变量

**Files:**
- Modify: `web/pages/index.tsx:545-549`

- [ ] **Step 1: 恢复状态变量（移除 underscore 前缀）**

当前:
```ts
const [_isKnowledgePanelOpen, _setIsKnowledgePanelOpen] = useState(false);
const [_knowledgeSearchQuery, _setKnowledgeSearchQuery] = useState('');
const [_isDbPanelOpen, _setIsDbPanelOpen] = useState(false);
const [_dbSearchQuery, _setDbSearchQuery] = useState('');
```

改为:
```ts
const [isKnowledgePanelOpen, setIsKnowledgePanelOpen] = useState(false);
const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState('');
const [isDbPanelOpen, setIsDbPanelOpen] = useState(false);
const [dbSearchQuery, setDbSearchQuery] = useState('');
```

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "fix(homepage): restore state variable names"
```

---

## Task 2: 恢复工具栏 Dropdown

**Files:**
- Modify: `web/pages/index.tsx:2960-2972`

- [ ] **Step 1: 替换简化工具栏为完整 Dropdown**

当前 (简化版):
```tsx
<div className='flex items-center gap-1'>
  <Tooltip title='Upload'>
    <div className='w-8 h-8 ...'>
      <PaperClipOutlined />
    </div>
  </Tooltip>
  <Tooltip title='Layout'>
    <div className='w-8 h-8 ...'>
      <AppstoreOutlined />
    </div>
  </Tooltip>
</div>
```

替换为:
```tsx
<div className='flex items-center gap-4'>
  {/* Add Button with Dropdown Menu */}
  <Dropdown
    menu={{
      items: [
        {
          key: 'upload',
          label: (
            <Upload {...uploadProps}>
              <div className='w-full'>{t('add_from_local')}</div>
            </Upload>
          ),
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
          onClick: () => setTimeout(() => setIsDbPanelOpen(true), 100),
        },
      ],
    }}
    trigger={['click']}
  >
    <Tooltip title={t('add_context')}>
      <Button
        type='text'
        shape='circle'
        size='small'
        icon={<PlusOutlined />}
        className='flex items-center justify-center text-gray-500 hover:text-violet-600 bg-gradient-to-b from-white to-gray-50 dark:from-[#2a2b2f] dark:to-[#1e1f24] dark:text-gray-300 border border-gray-200/80 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-[0.5px] hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] dark:hover:border-white/20 transition-all flex-shrink-0'
      />
    </Tooltip>
  </Dropdown>

  {/* Skill Selector Popover */}
  <Popover
    trigger='click'
    placement='topLeft'
    open={isSkillPanelOpen}
    onOpenChange={setIsSkillPanelOpen}
    overlayClassName='manus-skill-menu'
    overlayInnerStyle={{ padding: 0, borderRadius: 12 }}
    content={
      <div className='w-[320px] bg-white dark:bg-[#2c2d31] rounded-xl shadow-xl overflow-hidden'>
        <div className='p-3 border-b border-gray-100 dark:border-gray-700'>
          <Input
            placeholder={t('search_skill')}
            prefix={<SearchOutlined className='text-gray-400' />}
            value={skillSearchQuery}
            onChange={e => setSkillSearchQuery(e.target.value)}
            className='rounded-lg'
            allowClear
            size='small'
          />
        </div>
        <div className='max-h-[300px] overflow-y-auto'>
          {(skillsList || [])
            .filter(
              skill =>
                !skillSearchQuery ||
                skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
                skill.description.toLowerCase().includes(skillSearchQuery.toLowerCase()),
            )
            .map(skill => (
              <div
                key={skill.id}
                onClick={() => {
                  if (selectedSkill?.id === skill.id) {
                    setSelectedSkill(null);
                    setQuery('');
                  } else {
                    setSelectedSkill(skill);
                    setQuery(`/${skill.name} `);
                  }
                  setIsSkillPanelOpen(false);
                  setSkillSearchQuery('');
                }}
                className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedSkill?.id === skill.id ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                }`}
              >
                <div className='flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs'>
                  {skill.icon || <ThunderboltOutlined />}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='font-medium text-sm text-gray-800 dark:text-gray-200'>
                      {skill.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        skill.type === 'official'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {skill.type === 'official' ? '官方' : '个人'}
                    </span>
                  </div>
                  <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2'>
                    {skill.description}
                  </p>
                </div>
                {selectedSkill?.id === skill.id && (
                  <CheckCircleFilled className='text-purple-500 flex-shrink-0 text-sm' />
                )}
              </div>
            ))}
          {(skillsList || []).filter(
            skill =>
              !skillSearchQuery ||
              skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
              skill.description.toLowerCase().includes(skillSearchQuery.toLowerCase()),
          ).length === 0 && (
            <div className='text-center py-8 text-gray-400'>
              <ThunderboltOutlined className='text-2xl mb-2 opacity-50' />
              <div className='text-xs'>
                {skillSearchQuery ? '未找到匹配的技能' : '暂无可用技能'}
              </div>
            </div>
          )}
        </div>
        <div className='border-t border-gray-100 dark:border-gray-700 px-3 py-2 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50'>
          <span className='text-[10px] text-gray-400'>
            {(skillsList || []).length} 个技能可用
          </span>
          <Button
            type='link'
            size='small'
            onClick={() => {
              router.push('/construct/skills');
              setIsSkillPanelOpen(false);
            }}
            className='text-[10px] p-0 h-auto'
          >
            管理技能 →
          </Button>
        </div>
      </div>
    }
  >
    <Tooltip
      title={
        selectedSkill ? t('skill_selected', { name: selectedSkill.name }) : t('select_skill')
      }
    >
      <Button
        type='text'
        shape='circle'
        size='small'
        icon={<ThunderboltOutlined />}
        className='flex items-center justify-center text-gray-500 hover:text-violet-600 bg-gradient-to-b from-white to-gray-50 dark:from-[#2a2b2f] dark:to-[#1e1f24] dark:text-gray-300 border border-gray-200/80 dark:border-white/10 shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,1)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-[0.5px] hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,1)] dark:hover:border-white/20 transition-all flex-shrink-0'
      />
    </Tooltip>
  </Popover>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): restore toolbar dropdown and skill popover"
```

---

## Task 3: 调整 Flex 布局

**Files:**
- Modify: `web/pages/index.tsx:2845-2846`

- [ ] **Step 1: 修改外层容器**

当前 (line 2845):
```tsx
<div className='flex-1 flex flex-col items-center px-6 py-8 pb-20 overflow-y-auto'>
```

改为:
```tsx
<div className='flex-1 flex flex-col items-center px-6 py-8 pb-20 overflow-y-auto justify-between'>
```

- [ ] **Step 2: 修改内层容器**

当前 (line 2846):
```tsx
<div className='w-full max-w-[860px] flex flex-col items-center animate-fade-in-up'>
```

改为:
```tsx
<div className='w-full max-w-[860px] flex flex-col items-center animate-fade-in-up flex-1'>
```

- [ ] **Step 3: Commit**

```bash
git add web/pages/index.tsx
git commit -m "feat(homepage): adjust flex layout to pin input box at bottom"
```

---

## Task 4: 构建验证

- [ ] **Step 1: 运行构建**

```bash
cd web && yarn build 2>&1 | tail -20
```

预期: 构建成功

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat(homepage): implement layout v2 - toolbar restored, input pinned to bottom"
```

---

## 任务依赖关系

```
Task 1 (State vars) ────────────────────┐
                                         ↓
Task 2 (Toolbar) ────────────────────────┤
                                         ↓
Task 3 (Flex layout) ───────────────────┤
                                         ↓
Task 4 (Build verification)
```