'use client';

import PageHeader from '@/new-components/common/PageHeader';
import Toolbar from '@/new-components/common/Toolbar';
import { StarOutlined } from '@ant-design/icons';
import { Empty } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function FavoritesPage() {
  const { t } = useTranslation();
  const [searchKeyword, setSearchKeyword] = useState('');

  // TODO: Replace with actual API data when backend is ready
  const favoritesList: any[] = [];

  const filteredList = favoritesList.filter(item => {
    if (!searchKeyword.trim()) return true;
    return item.title?.toLowerCase().includes(searchKeyword.toLowerCase());
  });

  return (
    <div className='flex flex-col h-full w-full px-6 py-4'>
      <PageHeader title={t('favorites') || '收藏夹'} description={t('favorites_desc') || '查看和管理您收藏的内容'} />
      <div className='mb-4'>
        <Toolbar searchPlaceholder={t('favorites_search') || '搜索收藏...'} onSearch={val => setSearchKeyword(val)} />
      </div>
      <div className='flex-1 overflow-y-auto'>
        {filteredList.length === 0 ? (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center'>
              <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center'>
                <StarOutlined className='text-4xl text-[var(--text-tertiary)]' />
              </div>
              <Empty description={t('favorites_empty') || '暂无收藏'} />
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredList.map(item => (
              <div
                key={item.id}
                className='bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)] p-4 hover:shadow-lg transition-shadow cursor-pointer'
              >
                <div className='flex items-start gap-3'>
                  <div className='w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center'>
                    <StarOutlined className='text-primary' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-[var(--text-primary)] truncate'>{item.title}</div>
                    <div className='text-sm text-[var(--text-secondary)] mt-1 line-clamp-2'>{item.description}</div>
                    <div className='text-xs text-[var(--text-tertiary)] mt-2'>{item.date}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
