'use client';

import CategoryPanel, { ActiveCategory } from '@/components/CategoryPanel';
import ConversationList from '@/components/ConversationList';
import { DnDProvider } from '@/components/DndContext';
import { getUserId } from '@/utils';
import { useState } from 'react';

function ReportsPage() {
  const userName = getUserId() || '';
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>({
    type: 'system',
    id: 'all',
  });
  const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0);

  const handleCategoryChange = (category: ActiveCategory) => {
    setActiveCategory(category);
  };

  const handleCategoriesChange = () => {
    setCategoriesRefreshKey(k => k + 1);
  };

  return (
    <DnDProvider>
      <div className='flex h-full w-full'>
        <CategoryPanel onCategoryChange={handleCategoryChange} userName={userName} />
        <div className='flex-1 flex flex-col overflow-hidden px-6 py-4'>
          <ConversationList
            activeCategory={activeCategory}
            userName={userName}
            onCategoriesChange={handleCategoriesChange}
            key={categoriesRefreshKey}
          />
        </div>
      </div>
    </DnDProvider>
  );
}

export default ReportsPage;
