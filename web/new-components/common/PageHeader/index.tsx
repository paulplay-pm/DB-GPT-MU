'use client';

import classNames from 'classnames';
import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions, className }) => {
  return (
    <div className={classNames('flex items-start justify-between mb-6', className)}>
      <div className='flex flex-col'>
        <h1 className='text-[24px] font-semibold text-[--text-primary] m-0'>{title}</h1>
        {description && <p className='text-[13px] text-[var(--text-secondary)] mt-1 mb-0'>{description}</p>}
      </div>
      {actions && <div className='flex items-center gap-2'>{actions}</div>}
    </div>
  );
};

export default PageHeader;
