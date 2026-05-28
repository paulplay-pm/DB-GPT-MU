# 顶部操作栏 (TopActionBar) 设计文档

> 日期：2026-05-28

## 1. 概述

在所有一级页面（包含 Chat 首页）的内容区顶部添加固定的 TopActionBar，高度与左侧导航栏顶部一致（h-16 = 64px）。

### 功能需求

1. **面包屑导航**：显示当前页面层级关系
2. **帮助入口**：从右下角 FloatHelper 迁移到顶部 bar
3. **通知入口**：BellOutlined 图标，点击显示空列表弹窗
4. **新建对话**：快速创建新对话功能

## 2. 布局结构

```
┌────────────────────────────────────────────────────────────────────┐
│ h-16 (64px)                                                        │
│  ┌──────────────────┐                      ┌────────────────────┐ │
│  │  面包屑区域       │                      │  操作按钮区域       │ │
│  │  [父页面名 / 子页面名] │                      │ [？][🔔][+ 新建对话] │ │
│  └──────────────────┘                      └────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### 左右分布

- **左侧 (flex-1)**：面包屑区域，左对齐
- **右侧 (flex-shrink-0)**：操作按钮区域，右对齐，固定间距

## 3. 面包屑逻辑

### 父子页面识别规则

| 场景 | 父 | 子 | 示例 |
|------|----|----|------|
| 一级页面，无子页面跳转 | 当前页面名称 | 无 | 我的报告 |
| 一级页面，点击会话进入子页面 | 当前页面名称 | 任务名称 | 我的报告 / 任务名称 |

### 实现机制

1. **父子关系约定**：
   - 使用 URL 参数 `?parent=xxx` 在跳转时传递父页面信息
   - 例如：从报告页点击会话 → `/?id=xxx&parent=reports`

2. **父页面名称映射**（从 NAV_GROUPS 配置获取）：
   ```tsx
   const PAGE_NAME_MAP: { [key: string]: string } = {
     '/': 'chat',
     '/reports': 'reports',
     '/favorites': 'favorites',
     '/templates': 'templates',
     '/team': 'team',
     '/construct/database': 'datasources',
     '/construct/knowledge': 'knowledge',
     '/construct/skills': 'skills',
     '/construct/prompt': 'prompts',
     '/construct/flow': 'awel_workflow',
     '/construct/app': 'app_management',
     '/construct/models': 'model_management',
     '/models_evaluation': 'models_evaluation',
     '/construct/dbgpts': 'dbgpts_community',
     '/admin/registration': 'registration_review',
     '/admin/user': 'user_management',
     '/admin/role': 'role_management',
     '/admin/dept': 'dept_management',
     '/admin/permission': 'permission_management',
   };
   ```

3. **子页面名称**：
   - 通过页面标题或路由参数获取
   - 例如：从 URL `?id=xxx` 获取会话标题作为子页面名称

### 交互行为

- 点击"父页面名"：跳转到父页面路径
- 无子页面时：仅显示父页面名（不可点击）

## 4. 右侧操作按钮

### 4.1 帮助按钮

- **图标**：QuestionCircleOutlined
- **行为**：点击打开帮助文档（新窗口）
- **来源**：从 `FloatHelper` 迁移，`href='http://docs.dbgpt.cn'`

### 4.2 通知按钮

- **图标**：BellOutlined
- **行为**：点击显示空列表弹窗
- **弹窗内容**："暂无通知" + 关闭按钮

### 4.3 新建对话按钮

- **内容**：PlusOutlined 图标 + "新建对话" 文字
- **样式**：Primary 按钮（蓝色背景白色文字）
- **行为**：点击跳转到首页 `/?id=`（新建空对话）

## 5. 组件结构

### TopActionBar 组件

```tsx
// web/new-components/layout/TopActionBar/index.tsx

interface TopActionBarProps {
  // 可选：如果需要强制刷新状态
  refresh?: number;
}

function TopActionBar({ refresh }: TopActionBarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  
  // 获取面包屑信息
  const breadcrumbs = useMemo(() => {
    // 1. 从 NAV_GROUPS 查找当前页面配置
    // 2. 检查 URL 是否有 parent 参数
    // 3. 返回 { parent, child } 结构
  }, [router.pathname, router.query, refresh]);
  
  // 右侧按钮
  const handleHelp = () => window.open('http://docs.dbgpt.cn', '_blank');
  const handleNotification = () => Modal.info({ title: '暂无通知', content: null });
  const handleNewChat = () => router.push('/');
  
  return (
    <div className='h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)]'>
      {/* 左侧：面包屑 */}
      <div className='flex items-center gap-2'>
        {breadcrumbs.child ? (
          <>
            <span 
              className='text-[var(--text-secondary)] cursor-pointer hover:text-primary'
              onClick={() => router.push(breadcrumbs.parentPath)}
            >
              {t(breadcrumbs.parent)}
            </span>
            <span className='text-[var(--text-tertiary)]'>/</span>
            <span className='text-[var(--text-primary)] font-medium'>
              {breadcrumbs.child}
            </span>
          </>
        ) : (
          <span className='text-[var(--text-primary)] font-medium'>
            {t(breadcrumbs.parent)}
          </span>
        )}
      </div>
      
      {/* 右侧：操作按钮 */}
      <div className='flex items-center gap-4'>
        <Tooltip title={t('help')}>
          <QuestionCircleOutlined 
            className='text-lg cursor-pointer hover:text-primary'
            onClick={handleHelp}
          />
        </Tooltip>
        
        <Tooltip title={t('notification')}>
          <BellOutlined 
            className='text-lg cursor-pointer hover:text-primary'
            onClick={handleNotification}
          />
        </Tooltip>
        
        <Button 
          type='primary' 
          icon={<PlusOutlined />}
          onClick={handleNewChat}
        >
          {t('new_chat')}
        </Button>
      </div>
    </div>
  );
}
```

### _app.tsx 改造

```tsx
// web/pages/_app.tsx

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  // ... 现有代码保持不变 ...
  
  return (
    <ConfigProvider ...>
      <App>{renderContent()}</App>
    </ConfigProvider>
  );
}

function renderContent() {
  // 现有逻辑保持不变，增加 TopActionBar
  return (
    <div className='flex w-screen h-screen overflow-hidden'>
      <Head>...</Head>
      <Sidebar />
      
      <div className='flex flex-col flex-1 relative overflow-hidden'>
        <TopActionBar />  {/* 新增 */}
        {children}
      </div>
      
      {/* FloatHelper 可以保留，但帮助功能已迁移到 TopActionBar */}
      {/* <FloatHelper /> */}
    </div>
  );
}
```

## 6. 页面跳转改造

### 报告页点击会话

```tsx
// pages/reports/index.tsx

// 在会话列表项的 onClick 中
onClick={() => router.push(`/?id=${conv.conv_uid}&parent=reports`)}
```

### 其他页面跳转子页面时

同样通过 URL 参数 `?parent=xxx` 传递父页面信息。

## 7. 样式变量

使用现有 CSS 变量保持一致性：

- 背景色：`var(--bg-secondary)` 或白色
- 边框：`border-[var(--border-color)]`
- 文字颜色：`var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
- 高度：`h-16` (64px)

## 8. 需确认事项

1. **FloatHelper 处置**：移除还是保留（帮助功能已迁移）？
2. **Chat 页面 ChatHeader**：是否需要移除或隐藏？
3. **移动端适配**：是否需要在移动端隐藏此 bar？

## 9. 依赖项

- Ant Design icons: `QuestionCircleOutlined`, `BellOutlined`, `PlusOutlined`
- Ant Design components: `Tooltip`, `Button`, `Modal`
- i18n translations: `help`, `notification`, `new_chat`, `no_notification`
