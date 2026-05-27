'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/new-components/common/PageHeader';
import Toolbar from '@/new-components/common/Toolbar';
import MyEmpty from '@/new-components/common/MyEmpty';

const TEMPLATE_CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'report', label: '报表' },
  { key: 'dashboard', label: '仪表盘' },
  { key: 'chart', label: '图表' },
];

function TemplatesPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categoryFilters = TEMPLATE_CATEGORIES.map(cat => ({
    key: cat.key,
    label: t(`templates_category_${cat.key}`) || cat.label,
  }));

  return (
    <div className='flex flex-col h-full w-full px-6 py-4'>
      <PageHeader
        title={t('templates') || '模板广场'}
        description={t('templates_desc') || '发现和使用优秀的报告模板'}
      />

      <Toolbar
        searchPlaceholder={t('templates_search') || '搜索模板...'}
        filters={categoryFilters}
        selectedFilter={selectedCategory}
        onFilterChange={setSelectedCategory}
      />

      <div className='flex-1 flex items-center justify-center'>
        <MyEmpty description={t('templates_empty') || '暂无模板'} />
      </div>
    </div>
  );
}

export default TemplatesPage;