'use client';

import { useDnD } from '@/components/DndContext';
import { CategoryItem } from '@/types/chat';
import { MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Dropdown } from 'antd';
import { useState } from 'react';
import { ActiveCategory } from '.';

interface CustomCategoriesProps {
  categories: CategoryItem[];
  activeCategory: ActiveCategory;
  onSelect: (category: ActiveCategory) => void;
  editingId: number | null;
  onEditStart: (id: number | null) => void;
  onEditCancel: () => void;
  onRename: (categoryId: number, newName: string) => void;
  onDeleteStart: (id: number | null) => void;
  onDropConversation: (convUid: string, categoryId: number) => void;
}

function CustomCategories({
  categories,
  activeCategory,
  onSelect,
  editingId,
  onEditStart,
  onEditCancel,
  onRename,
  onDeleteStart,
  onDropConversation,
}: CustomCategoriesProps) {
  const { draggingConvUid, draggingOverCategoryId, setDraggingOverCategoryId } = useDnD();

  const handleDragOver = (e: React.DragEvent, categoryId: number) => {
    if (draggingConvUid) {
      e.preventDefault();
      setDraggingOverCategoryId(categoryId);
    }
  };

  const handleDragLeave = () => {
    setDraggingOverCategoryId(null);
  };

  const handleDrop = (categoryId: number) => {
    if (draggingConvUid) {
      onDropConversation(draggingConvUid, categoryId);
    }
    setDraggingOverCategoryId(null);
  };

  return (
    <div className='px-2'>
      {categories.map(cat => {
        const isActive = activeCategory.type === 'custom' && activeCategory.id === cat.category_id;
        const isEditing = editingId === cat.category_id;
        const isDropTarget = draggingOverCategoryId === cat.category_id;

        return (
          <div key={cat.category_id}>
            {isEditing ? (
              <InlineEdit
                initialValue={cat.name}
                onSave={newName => onRename(cat.category_id, newName)}
                onCancel={onEditCancel}
              />
            ) : (
              <div
                onClick={() => onSelect({ type: 'custom', id: cat.category_id })}
                onDragOver={e => handleDragOver(e, cat.category_id)}
                onDragLeave={handleDragLeave}
                onDrop={e => {
                  e.preventDefault();
                  handleDrop(cat.category_id);
                }}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all mb-1 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-100/50 to-transparent border-l-[3px] border-purple-500'
                    : 'hover:bg-[var(--bg-hover)]'
                } ${isDropTarget ? 'bg-purple-100/50 border-l-[3px] border-purple-400' : ''}`}
              >
                <div className='flex items-center gap-2 min-w-0 flex-1'>
                  <span className='w-2 h-2 rounded-full flex-shrink-0' style={{ backgroundColor: cat.color }} />
                  <span
                    className={`text-sm truncate ${
                      isActive ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {cat.name}
                  </span>
                </div>
                <Dropdown
                  trigger={['click']}
                  menu={
                    {
                      items: [
                        {
                          key: 'rename',
                          label: '重命名',
                          onClick: () => onEditStart(cat.category_id),
                        },
                        {
                          key: 'delete',
                          label: '删除',
                          danger: true,
                          onClick: () => onDeleteStart(cat.category_id),
                        },
                      ],
                    } as MenuProps
                  }
                >
                  <button
                    onClick={e => e.stopPropagation()}
                    className='p-1 hover:bg-[var(--bg-hover)] rounded text-xs text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100'
                  >
                    <MoreOutlined />
                  </button>
                </Dropdown>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InlineEdit({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  const handleSave = () => {
    if (value.trim()) {
      onSave(value.trim());
    } else {
      onCancel();
    }
  };

  return (
    <div className='flex items-center gap-2 px-3 py-2'>
      <input
        type='text'
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') onCancel();
        }}
        onBlur={handleSave}
        autoFocus
        maxLength={20}
        className='flex-1 px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:border-purple-500'
      />
    </div>
  );
}

export default CustomCategories;
