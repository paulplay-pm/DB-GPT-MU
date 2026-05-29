'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';

interface ToolbarProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  batchMode: boolean;
  onBatchModeToggle: () => void;
}

function Toolbar({ searchKeyword, onSearchChange, batchMode, onBatchModeToggle }: ToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className='flex items-center gap-3 mb-4'>
      <Input
        variant='filled'
        prefix={<SearchOutlined />}
        placeholder={t('search_conversations') || '搜索会话...'}
        value={searchKeyword}
        onChange={e => onSearchChange(e.target.value)}
        allowClear
        className='w-[230px]'
      />
      <button
        onClick={onBatchModeToggle}
        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
          batchMode
            ? 'border-purple-500 text-purple-500 bg-purple-50'
            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-purple-300 hover:text-purple-500'
        }`}
      >
        {t('batch_management') || '批量管理'}
      </button>
    </div>
  );
}

export default Toolbar;
