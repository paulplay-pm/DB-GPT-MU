# 品牌配置实时同步设计方案

> **Date:** 2026-05-31
> **Author:** Claude

## 1. 目标

实现品牌配置（Logo、产品名称、Slogan）的实时同步机制：
1. 系统配置页面保存后，左侧导航栏顶部立即显示新的 Logo + 产品名称
2. 对话页面的 Slogan 同步更新
3. 导航菜单「系统配置」支持中英文国际化
4. 菜单图标改为 SettingOutlined 并使用彩色显示

## 2. 架构设计

### 2.1 BrandContext

创建 `context/BrandContext.tsx`，管理品牌配置状态：

```typescript
interface BrandConfig {
  logo_url: string | null;
  product_name_zh: string;
  product_name_en: string;
  slogan: string;
}

const BrandContext = createContext<{
  brandConfig: BrandConfig;
  updateBrandConfig: (config: Partial<BrandConfig>) => void;
}>(...);
```

### 2.2 数据流

```
保存品牌配置 → BrandContext.update() → localStorage.setItem('brand_config', json)
                                                        ↓
                          ┌──────────────────────────────┐
                          │       storage 事件          │
                          └──────────────────────────────┘
          │                           │                        │
          ▼                           ▼                        ▼
┌──────────────────┐    ┌──────────────────────┐  ┌─────────────────┐
│  NewSideBar      │    │   Chat Page          │  │  其他监听组件   │
│  Logo + 产品名称  │    │   Slogan 显示        │  │                │
└──────────────────┘    └──────────────────────┘  └─────────────────┘
```

### 2.3 组件职责

| 组件 | 职责 |
|------|------|
| `BrandContext` | 状态管理 + localStorage 广播 |
| `SystemConfigPage` | 保存配置后调用 `updateBrandConfig()` |
| `NewSideBar` | 监听 storage 事件，显示 Logo + 产品名称 |
| Chat 相关组件 | 监听 storage 事件，显示 slogan |

## 3. 文件修改

### 3.1 新建文件

- `web/context/BrandContext.tsx` - 品牌配置 Context

### 3.2 修改文件

| 文件 | 修改内容 |
|------|----------|
| `web/context/BrandContext.tsx` | 新建 |
| `web/components/layout/NewSideBar/index.tsx` | 顶部 Logo+名称使用 Context；添加 SettingOutlined 图标映射 |
| `web/pages/admin/system-config.tsx` | 保存后调用 `updateBrandConfig()` |
| `web/pages/chat/index.tsx` | 使用 BrandContext 显示 slogan |
| i18n 翻译文件 | 添加 system_config 翻译 |

## 4. 实现细节

### 4.1 BrandContext

```typescript
// 监听 localStorage 变化
useEffect(() => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'brand_config' && e.newValue) {
      setBrandConfig(JSON.parse(e.newValue));
    }
  };
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### 4.2 NewSideBar Logo 区域

```tsx
<div className='flex items-center gap-3 hover:opacity-80'>
  {brandConfig.logo_url ? (
    <img src={brandConfig.logo_url} className='w-8 h-8 rounded-lg' />
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

### 4.3 Icon 映射

```typescript
const ICON_MAP: Record<string, ReactNode> = {
  // ... existing
  SettingOutlined: <SettingOutlined />,
};

const ICON_COLORS: Record<string, string> = {
  // ... existing
  system_config: 'text-[#1677FF]', // 🔵 蓝色
};
```

## 5. i18n 翻译

在翻译文件中添加：

```json
{
  "system_config": {
    "zh": "系统配置",
    "en": "System Config"
  }
}
```

## 6. 验收标准

- [ ] 保存品牌配置后，NewSideBar 顶部立即显示新的 Logo + 产品名称
- [ ] 保存 Slogan 后，对话页面同步显示新的 Slogan
- [ ] 菜单「系统配置」显示为中英文而非 system_config
- [ ] 图标为 SettingOutlined，彩色显示，与其他菜单交互一致