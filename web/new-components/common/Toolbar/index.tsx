'use client';

import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

interface Filter {
  label: string;
  key: string;
}

interface ToolbarProps {
  searchPlaceholder?: string;
  filters?: Filter[];
  onSearch?: (value: string) => void;
  onFilterChange?: (key: string) => void;
  selectedFilter?: string;
  className?: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
  searchPlaceholder = 'Search...',
  filters = [],
  onSearch,
  onFilterChange,
  selectedFilter,
  className,
}) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  const handleFilterClick = (key: string) => {
    onFilterChange?.(key);
  };

  return (
    <div className={classNames('flex items-center gap-4 mb-4', className)}>
      <Input
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={e => handleSearch(e.target.value)}
        className='w-64 rounded-[8px] bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]'
      />
      {filters.length > 0 && (
        <div className='flex items-center gap-2'>
          {filters.map(filter => (
            <button
              key={filter.key}
              onClick={() => handleFilterClick(filter.key)}
              className={classNames(
                'px-4 py-1.5 rounded-[20px] text-[14px] transition-colors',
                selectedFilter === filter.key
                  ? 'bg-[var(--input-bg)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]',
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Toolbar;
