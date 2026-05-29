'use client';

import { CategoryItem } from '@/types/chat';
import { useTranslation } from 'react-i18next';

interface MoveCategoryModalProps {
  visible: boolean;
  categories: CategoryItem[];
  selectedCount: number;
  onMove: (categoryId: number | null) => void;
  onCancel: () => void;
}

function MoveCategoryModal({ visible, categories, selectedCount, onMove, onCancel }: MoveCategoryModalProps) {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={onCancel} />
      <div className='relative bg-white dark:bg-gray-800 rounded-xl p-6 w-[380px] shadow-xl'>
        <div className='text-base font-medium text-[var(--text-primary)] mb-2'>
          {t('move_to_category') || '移动到分类'}
        </div>
        <div className='text-sm text-[var(--text-secondary)] mb-6'>
          {t('selected_count', { count: selectedCount }) || `已选 ${selectedCount} 项`}
        </div>

        <div className='space-y-2 mb-6 max-h-[300px] overflow-y-auto'>
          {categories.map(cat => (
            <div
              key={cat.category_id}
              onClick={() => onMove(cat.category_id)}
              className='flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-[var(--bg-hover)]'
            >
              <span className='w-3 h-3 rounded-full' style={{ backgroundColor: cat.color }} />
              <span className='text-sm text-[var(--text-primary)]'>{cat.name}</span>
            </div>
          ))}
          <div
            onClick={() => onMove(null)}
            className='flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-[var(--bg-hover)]'
          >
            <span className='w-3 h-3 rounded-full bg-gray-300' />
            <span className='text-sm text-[var(--text-secondary)]'>{t('uncategorized') || '未分类'}</span>
          </div>
        </div>

        <div className='flex justify-end'>
          <button
            onClick={onCancel}
            className='px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          >
            {t('cancel') || '取消'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MoveCategoryModal;
