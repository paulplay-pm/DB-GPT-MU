'use client';

import { useTranslation } from 'react-i18next';
import PageHeader from '@/new-components/common/PageHeader';
import Toolbar from '@/new-components/common/Toolbar';
import MyEmpty from '@/new-components/common/MyEmpty';

function FavoritesPage() {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col h-full w-full px-6 py-4'>
      <PageHeader
        title={t('favorites') || '收藏夹'}
        description={t('favorites_desc') || '查看和管理您收藏的内容'}
      />

      <Toolbar
        searchPlaceholder={t('favorites_search') || '搜索收藏...'}
      />

      <div className='flex-1 flex items-center justify-center'>
        <MyEmpty description={t('favorites_empty') || '暂无收藏'} />
      </div>
    </div>
  );
}

export default FavoritesPage;