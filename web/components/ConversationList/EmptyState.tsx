'use client';

import { FileTextOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

function EmptyState() {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col items-center justify-center py-16'>
      <FileTextOutlined className='text-4xl text-[var(--text-tertiary)] mb-4' />
      <div className='text-sm text-[var(--text-secondary)]'>
        {t('no_conversations_in_category') || '该分类下暂无会话记录'}
      </div>
    </div>
  );
}

export default EmptyState;
