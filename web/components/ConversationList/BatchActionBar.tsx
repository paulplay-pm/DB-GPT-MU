'use client';

import { useTranslation } from 'react-i18next';

interface BatchActionBarProps {
  selectedCount: number;
  onMove: () => void;
  onPin: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

function BatchActionBar({ selectedCount, onMove, onPin, onDelete, onCancel }: BatchActionBarProps) {
  const { t } = useTranslation();

  return (
    <div className='flex items-center gap-3 px-4 py-3 mb-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl'>
      <span className='text-sm text-purple-600 dark:text-purple-400'>
        {t('selected_count', { count: selectedCount }) || `已选 ${selectedCount} 项`}
      </span>
      <div className='flex-1' />
      <button
        onClick={onMove}
        className='px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30'
      >
        {t('move_to_category') || '移动到分类'}
      </button>
      <button
        onClick={onPin}
        className='px-4 py-2 text-sm text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30'
      >
        {t('pin') || '置顶'}
      </button>
      <button
        onClick={onDelete}
        className='px-4 py-2 text-sm text-red-500 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30'
      >
        {t('delete') || '删除'}
      </button>
      <button
        onClick={onCancel}
        className='px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
      >
        {t('cancel') || '取消'}
      </button>
    </div>
  );
}

export default BatchActionBar;
