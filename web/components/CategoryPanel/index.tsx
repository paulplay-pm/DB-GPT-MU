'use client';

import { apiInterceptors, createCategory, deleteCategory, getCategoryList, renameCategory } from '@/client/api';
import { CategoryItem } from '@/types/chat';
import { PlusOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateCategoryModal from './CreateCategoryModal';
import CustomCategories from './CustomCategories';
import SystemCategories from './SystemCategories';

export type ActiveCategory = {
  type: 'system' | 'custom';
  id: 'all' | 'pinned' | 'uncategorized' | number;
};

interface CategoryPanelProps {
  onCategoryChange: (category: ActiveCategory) => void;
  userName: string;
  onDropConversation: (convUid: string, categoryId: number) => void;
}

function CategoryPanel({ onCategoryChange, userName, onDropConversation }: CategoryPanelProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>({
    type: 'system',
    id: 'all',
  });
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { run: fetchCategories } = useRequest(
    async () => {
      const [, res] = await apiInterceptors(getCategoryList(userName));
      return res || [];
    },
    {
      onSuccess: data => {
        setCategories(data);
      },
    },
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategorySelect = useCallback(
    (category: ActiveCategory) => {
      setActiveCategory(category);
      onCategoryChange(category);
    },
    [onCategoryChange],
  );

  const handleCreateCategory = useCallback(
    async (name: string, color: string) => {
      const [, res] = await apiInterceptors(createCategory({ user_name: userName, name, color }));
      if (res) {
        fetchCategories();
        setCreateModalVisible(false);
      }
    },
    [userName, fetchCategories],
  );

  const handleRenameCategory = useCallback(
    async (categoryId: number, newName: string) => {
      const [, res] = await apiInterceptors(renameCategory(categoryId, { name: newName }, userName));
      if (res) {
        fetchCategories();
        setEditingCategoryId(null);
      }
    },
    [userName, fetchCategories],
  );

  const handleDeleteCategory = useCallback(
    async (categoryId: number) => {
      const [, success] = await apiInterceptors(deleteCategory(categoryId, userName));
      if (success) {
        fetchCategories();
        setDeleteConfirmId(null);
        if (activeCategory.type === 'custom' && activeCategory.id === categoryId) {
          handleCategorySelect({ type: 'system', id: 'all' });
        }
      }
    },
    [userName, fetchCategories, activeCategory, handleCategorySelect],
  );

  return (
    <div className='h-full w-[224px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-[var(--border-color)] flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]'>
        <span className='text-sm font-medium text-[var(--text-primary)]'>
          {t('conversation_categories') || '会话分类'}
        </span>
        <PlusOutlined
          className='text-sm cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          onClick={() => setCreateModalVisible(true)}
        />
      </div>

      {/* Category List */}
      <div className='flex-1 overflow-y-auto py-2'>
        <SystemCategories activeCategory={activeCategory} onSelect={handleCategorySelect} />
        <CustomCategories
          categories={categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
          editingId={editingCategoryId}
          onEditStart={setEditingCategoryId}
          onEditCancel={() => setEditingCategoryId(null)}
          onRename={handleRenameCategory}
          onDeleteStart={setDeleteConfirmId}
          onDropConversation={onDropConversation}
        />
      </div>

      {/* Create Modal */}
      <CreateCategoryModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreate={handleCreateCategory}
      />

      {/* Delete Confirm */}
      {deleteConfirmId !== null && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black/50' onClick={() => setDeleteConfirmId(null)} />
          <div className='relative bg-white dark:bg-gray-800 rounded-xl p-6 w-[380px] shadow-xl'>
            <div className='text-base font-medium text-[var(--text-primary)] mb-2'>
              {t('delete_category_title') || '删除分类'}
            </div>
            <div className='text-sm text-[var(--text-secondary)] mb-6'>
              {t('delete_category_confirm') || '删除后，该分类下的会话将移动到"未分类"，是否继续？'}
            </div>
            <div className='flex justify-end gap-3'>
              <button
                className='px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                onClick={() => setDeleteConfirmId(null)}
              >
                {t('cancel') || '取消'}
              </button>
              <button
                className='px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg'
                onClick={() => handleDeleteCategory(deleteConfirmId)}
              >
                {t('confirm_delete') || '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoryPanel;
