'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

export interface BrandConfig {
  logo_url: string | null;
  product_name_zh: string;
  product_name_en: string;
  slogan: string;
  slogan_en: string;
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
  slogan_en: 'Ask Data, Find Insights',
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

  return <BrandContext.Provider value={{ brandConfig, updateBrandConfig }}>{children}</BrandContext.Provider>;
}
