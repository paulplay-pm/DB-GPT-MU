'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PRESET_COLORS = [
  { name: '蓝色', value: '#3B82F6' },
  { name: '绿色', value: '#10B981' },
  { name: '紫色', value: '#8B5CF6' },
  { name: '琥珀色', value: '#F59E0B' },
  { name: '红色', value: '#EF4444' },
  { name: '粉色', value: '#EC4899' },
  { name: '青色', value: '#06B6D4' },
];

interface CreateCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

function CreateCategoryModal({ visible, onClose, onCreate }: CreateCategoryModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].value);
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (!name.trim()) {
      setError(t('category_name_required') || '分类名称不能为空');
      return;
    }
    onCreate(name.trim(), color);
    setName('');
    setColor(PRESET_COLORS[0].value);
    setError('');
  };

  const handleClose = () => {
    setName('');
    setColor(PRESET_COLORS[0].value);
    setError('');
    onClose();
  };

  if (!visible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={handleClose} />
      <div className='relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-[380px] shadow-xl'>
        <div className='text-base font-medium text-[var(--text-primary)] mb-2'>
          {t('create_category') || '新建分类'}
        </div>
        <div className='text-sm text-[var(--text-secondary)] mb-6'>
          {t('create_category_desc') || '创建一个分类来组织你的会话记录'}
        </div>

        {/* Name input */}
        <div className='mb-6'>
          <label className='block text-sm text-[var(--text-secondary)] mb-2'>{t('category_name') || '分类名称'}</label>
          <input
            type='text'
            value={name}
            onChange={e => {
              setName(e.target.value.slice(0, 20));
              setError('');
            }}
            placeholder={t('category_name_placeholder') || '例如：销售分析、周报汇总...'}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-purple-500 ${
              error ? 'border-red-500' : 'border-[var(--border-color)]'
            }`}
            autoFocus
          />
          {error && <div className='text-xs text-red-500 mt-1'>{error}</div>}
          <div className='text-xs text-[var(--text-tertiary)] mt-1 text-right'>{name.length}/20</div>
        </div>

        {/* Color picker */}
        <div className='mb-6'>
          <label className='block text-sm text-[var(--text-secondary)] mb-2'>{t('category_color') || '颜色'}</label>
          <div className='flex gap-2'>
            {PRESET_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  color === c.value ? 'ring-2 ring-purple-500 ring-offset-2 scale-110' : ''
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className='flex justify-end gap-3'>
          <button
            className='px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            onClick={handleClose}
          >
            {t('cancel') || '取消'}
          </button>
          <button
            className='px-4 py-2 text-sm text-white bg-purple-500 hover:bg-purple-600 rounded-lg disabled:opacity-50'
            onClick={handleCreate}
            disabled={!name.trim()}
          >
            {t('create') || '创建'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCategoryModal;
