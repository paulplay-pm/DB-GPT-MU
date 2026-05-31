# 品牌配置实时同步实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现品牌配置（Logo、产品名称、Slogan）跨组件实时同步，菜单「系统配置」支持中英文国际化

**Architecture:** 通过 BrandContext 管理品牌配置状态，保存时写入 localStorage，其他组件通过监听 storage 事件实现实时同步

**Tech Stack:** React Context, localStorage, i18next, Ant Design Icons

---

## 文件结构

```
web/
├── context/
│   └── BrandContext.tsx          # 新建 - 品牌配置 Context
├── components/layout/
│   └── NewSideBar/
│       └── index.tsx             # 修改 - 顶部 Logo+名称 + 图标映射
├── pages/
│   ├── admin/
│   │   └── system-config.tsx      # 修改 - 保存后通知更新
│   └── chat/index.tsx             # 修改 - 显示 slogan
└── locales/
    ├── zh/common.ts               # 修改 - 添加翻译
    └── en/common.ts               # 修改 - 添加翻译
```

## Task 1: 创建 BrandContext

**Files:**
- Create: `web/context/BrandContext.tsx`

- [ ] **Step 1: 创建 BrandContext.tsx**

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface BrandConfig {
  logo_url: string | null;
  product_name_zh: string;
  product_name_en: string;
  slogan: string;
}

interface BrandContextType {
  brandConfig: BrandConfig;
  updateBrandConfig: (config: Partial<BrandConfig>) => void;
}

const defaultBrandConfig: BrandConfig = {
  logo_url: null,
  product_name_zh: 'DB-GPT',
  product_name_en: 'DB-GPT',
  slogan: '开口问数，预见洞察',
};

const STORAGE_KEY = 'brand_config';

const BrandContext = createContext<BrandContextType>({
  brandConfig: defaultBrandConfig,
  updateBrandConfig: () => {},
});

export const useBrand = () => useContext(BrandContext);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(defaultBrandConfig);

  // 初始化从 localStorage 加载
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBrandConfig(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // 监听其他标签页的更新
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setBrandConfig(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateBrandConfig = (config: Partial<BrandConfig>) => {
    const newConfig = { ...brandConfig, ...config };
    setBrandConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    // 触发其他组件更新
    window.dispatchEvent(new Event('brand_config_updated'));
  };

  return (
    <BrandContext.Provider value={{ brandConfig, updateBrandConfig }}>
      {children}
    </BrandContext.Provider>
  );
}
```

- [ ] **Step 2: 提交**

```bash
git add web/context/BrandContext.tsx
git commit -m "feat(web): add BrandContext for brand config state management

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

## Task 2: 在 _app.tsx 中注册 BrandProvider

**Files:**
- Modify: `web/pages/_app.tsx`

- [ ] **Step 1: 读取 _app.tsx 并添加 BrandProvider**

```typescript
import { BrandProvider } from '@/context/BrandContext';

// 在组件树中找到合适的位置包裹
<Component>
  {/* 其他 Provider */}
  <BrandProvider>
    <Component {...pageProps} />
  </BrandProvider>
</Component>
```

- [ ] **Step 2: 提交**

```bash
git add web/pages/_app.tsx
git commit -m "feat(web): register BrandProvider in _app

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

## Task 3: 修改 NewSideBar 顶部 Logo+名称区域

**Files:**
- Modify: `web/components/layout/NewSideBar/index.tsx:350-367`
- Modify: `web/context/BrandContext.tsx` (import useBrand)

- [ ] **Step 1: 添加 SettingOutlined 图标映射**

```typescript
// 在现有的 import 中添加
import { SettingOutlined } from '@ant-design/icons';

// 在 ICON_MAP 中添加
const ICON_MAP: Record<string, ReactNode> = {
  // ... existing
  SettingOutlined: <SettingOutlined />,
};

// ICON_COLORS 已有 system_config: 'text-[#1677FF]'
```

- [ ] **Step 2: 修改顶部 Logo 区域**

```tsx
// 在文件顶部添加 import
import { useBrand } from '@/context/BrandContext';

// 在 NewSideBar 组件中添加
export default function NewSideBar() {
  const { brandConfig } = useBrand();
  // ... existing code

  // 修改顶部 logo 区域 (约第 351-357 行)
  <div className='flex items-center gap-3 hover:opacity-80'>
    {brandConfig.logo_url ? (
      <img src={brandConfig.logo_url} className='w-8 h-8 rounded-lg object-cover' />
    ) : (
      <div className='w-8 h-8 bg-gradient-to-br from-[#31afff] to-[#1677ff] rounded-lg flex items-center justify-center'>
        <span className='text-white font-bold text-sm'>
          {brandConfig.product_name_zh.slice(0, 2)}
        </span>
      </div>
    )}
    <span className='font-semibold text-[var(--text-primary)]'>
      {brandConfig.product_name_zh}
    </span>
  </div>
```

- [ ] **Step 3: 提交**

```bash
git add web/components/layout/NewSideBar/index.tsx
git commit -m "feat(web): use BrandContext for sidebar logo and title

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

## Task 4: 修改 SystemConfigPage 保存后通知更新

**Files:**
- Modify: `web/pages/admin/system-config.tsx`

- [ ] **Step 1: 添加 import 并在保存成功后调用 updateBrandConfig**

```typescript
import { useBrand } from '@/context/BrandContext';

// 在组件中添加
const { updateBrandConfig } = useBrand();

// 在 handleSave 函数中，保存成功后添加：
if (data) {
  updateBrandConfig(data);
  message.success('配置已保存');
}
```

- [ ] **Step 2: 提交**

```bash
git add web/pages/admin/system-config.tsx
git commit -m "feat(web): notify BrandContext on brand config save

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

## Task 5: 找到对话页面显示 Slogan 的位置并修改

**Files:**
- Modify: 相关对话页面组件

- [ ] **Step 1: 搜索 Slogan 显示位置**

```bash
grep -r "开口问数" web/pages/
```

- [ ] **Step 2: 使用 BrandContext 显示 slogan**

```tsx
import { useBrand } from '@/context/BrandContext';

// 在组件中
const { brandConfig } = useBrand();

// 将硬编码的 slogan 替换为 brandConfig.slogan
```

- [ ] **Step 3: 提交**

```bash
git add [修改的文件]
git commit -m "feat(web): use BrandContext for slogan display

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

## Task 6: 添加 i18n 翻译

**Files:**
- Modify: `web/locales/zh/common.ts`
- Modify: `web/locales/en/common.ts`

- [ ] **Step 1: 在 zh/common.ts 中添加翻译**

```typescript
// 在约第 518 行（permission_management 之后）添加
system_config: '系统配置',
```

- [ ] **Step 2: 在 en/common.ts 中添加翻译**

```typescript
// 在对应位置添加
system_config: 'System Config',
```

- [ ] **Step 3: 提交**

```bash
git add web/locales/zh/common.ts web/locales/en/common.ts
git commit -m "i18n(web): add system_config translation

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

## Task 7: 验证并测试

- [ ] **Step 1: 启动服务器**

```bash
source .venv/bin/activate
nohup dbgpt start webserver --profile qwen > /tmp/dbgpt.log 2>&1 &
sleep 8
```

- [ ] **Step 2: 登录并访问系统配置页面**

访问 http://localhost:3000/login，使用 kk/kk123456 登录

- [ ] **Step 3: 修改产品名称并保存**

修改产品名称后，检查侧边栏顶部是否立即更新

- [ ] **Step 4: 修改 Slogan 并保存**

修改 Slogan 后，检查对话页面是否同步更新

- [ ] **Step 5: 检查菜单显示**

检查「系统配置」菜单是否显示中英文而非 system_config

---

## 验收标准

- [ ] 保存品牌配置后，NewSideBar 顶部立即显示新的 Logo + 产品名称
- [ ] 保存 Slogan 后，对话页面同步显示新的 Slogan
- [ ] 菜单「系统配置」显示为中英文而非 system_config
- [ ] 图标为 SettingOutlined，彩色显示，与其他菜单交互一致