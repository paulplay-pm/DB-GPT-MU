'use client';

import { useTranslation } from 'react-i18next';
import PageHeader from '@/new-components/common/PageHeader';
import Toolbar from '@/new-components/common/Toolbar';
import MyEmpty from '@/new-components/common/MyEmpty';

function ReportsPage() {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col h-full w-full px-6 py-4'>
      <PageHeader
        title={t('reports') || '我的报告'}
        description={t('reports_desc') || '查看和管理您的分析报告'}
      />

      <Toolbar
        searchPlaceholder={t('reports_search') || '搜索报告...'}
      />

      <div className='flex-1 flex items-center justify-center'>
        <MyEmpty description={t('reports_empty') || '暂无报告'} />
      </div>
    </div>
  );
}

export default ReportsPage;