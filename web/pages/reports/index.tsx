'use client';

import CategoryPanel, { ActiveCategory } from '@/components/CategoryPanel';
import ConversationList from '@/components/ConversationList';
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

  const handleDropConversation = async (convUid: string, categoryId: number) => {
    const { apiInterceptors, moveConversations } = await import('@/client/api');
    await apiInterceptors(moveConversations({ conv_uids: [convUid], category_id: categoryId }, userName));
    handleCategoriesChange();
  };

  return (
    <div className='flex h-full w-full'>
      <CategoryPanel
        onCategoryChange={handleCategoryChange}
        userName={userName}
        onDropConversation={handleDropConversation}
      />
      <div className='flex-1 flex flex-col overflow-hidden px-6 py-4'>
        <ConversationList
          activeCategory={activeCategory}
          userName={userName}
          onCategoriesChange={handleCategoriesChange}
          listSource='reports'
          key={categoriesRefreshKey}
        />
      </div>
    </div>
  );
}

export default ReportsPage;
