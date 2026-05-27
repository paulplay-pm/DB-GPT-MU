'use client';

import { useTranslation } from 'react-i18next';
import PageHeader from '@/new-components/common/PageHeader';
import Toolbar from '@/new-components/common/Toolbar';
import MyEmpty from '@/new-components/common/MyEmpty';

function TeamPage() {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col h-full w-full px-6 py-4'>
      <PageHeader
        title={t('team') || '团队共享'}
        description={t('team_desc') || '查看团队成员共享的内容'}
      />

      <Toolbar
        searchPlaceholder={t('team_search') || '搜索共享内容...'}
      />

      <div className='flex-1 flex items-center justify-center'>
        <MyEmpty description={t('team_empty') || '暂无共享内容'} />
      </div>
    </div>
  );
}

export default TeamPage;