'use client';

import { FileTextOutlined, PushpinOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ActiveCategory } from '.';

const SYSTEM_CATEGORIES: Array<{
  id: 'all' | 'pinned' | 'uncategorized';
  labelKey: 'all' | 'pinned' | 'uncategorized';
  icon: typeof FileTextOutlined;
}> = [
  { id: 'all' as const, labelKey: 'all' as const, icon: FileTextOutlined },
  { id: 'pinned' as const, labelKey: 'pinned' as const, icon: PushpinOutlined },
  { id: 'uncategorized' as const, labelKey: 'uncategorized' as const, icon: UnorderedListOutlined },
];

interface SystemCategoriesProps {
  activeCategory: ActiveCategory;
  onSelect: (category: ActiveCategory) => void;
}

function SystemCategories({ activeCategory, onSelect }: SystemCategoriesProps) {
  const { t } = useTranslation();

  return (
    <div className='px-2 mb-2'>
      {SYSTEM_CATEGORIES.map(cat => {
        const isActive = activeCategory.type === 'system' && activeCategory.id === cat.id;
        const Icon = cat.icon;
        return (
          <div
            key={cat.id}
            onClick={() => onSelect({ type: 'system', id: cat.id })}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
              isActive
                ? 'bg-gradient-to-r from-purple-100/50 to-transparent border-l-[3px] border-purple-500'
                : 'hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Icon className={`text-sm ${isActive ? 'text-purple-500' : 'text-[var(--text-tertiary)]'}`} />
            <span
              className={`text-sm ${
                isActive ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
              }`}
            >
              {t(cat.labelKey) || cat.labelKey}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default SystemCategories;
