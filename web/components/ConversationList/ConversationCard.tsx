'use client';

import { useDnD } from '@/components/DndContext';
import { IChatDialogueSchema } from '@/types/chat';
import { DeleteOutlined, EditOutlined, MessageOutlined, MoreOutlined, PushpinOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Checkbox, Dropdown, Popconfirm } from 'antd';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface ConversationCardProps {
  conv: IChatDialogueSchema;
  batchMode: boolean;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onDelete: () => void;
  onPinToggle: () => void;
  onRename: (newName: string) => void;
  onMoveToCategory: () => void;
  categoryColor?: string;
  categoryName?: string;
  onDragEnd?: () => void;
  listSource?: 'chat' | 'reports';
}

function ConversationCard({
  conv,
  batchMode,
  selected,
  onSelect,
  onDelete,
  onPinToggle,
  onRename,
  onMoveToCategory,
  categoryColor,
  categoryName,
  onDragEnd,
  listSource = 'chat',
}: ConversationCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { setDraggingConvUid } = useDnD();

  const getTitle = () => {
    if (typeof conv.user_input === 'string' && conv.user_input.trim()) {
      return conv.user_input;
    }
    return '新对话';
  };

  const title = getTitle();

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    return moment(dateStr).fromNow();
  };

  const formatAbsoluteTime = (dateStr?: string) => {
    if (!dateStr) return '';
    return moment(dateStr).format('YYYY-MM-DD HH:mm');
  };

  const handleClick = () => {
    if (isEditing) return;
    // When from reports list, navigate to chat detail page but with from=reports
    // so TopActionBar shows "我的报告" as breadcrumb parent
    if (listSource === 'reports') {
      // chat_react_agent uses simple / route, other scenes use /chat with scene param
      if (conv.chat_mode === 'chat_react_agent') {
        router.push(`/?id=${conv.conv_uid}&title=${encodeURIComponent(title)}&from=reports`);
      } else {
        router.push(
          `/chat?scene=${conv.chat_mode}&id=${conv.conv_uid}&title=${encodeURIComponent(title)}&from=reports`,
        );
      }
      return;
    }
    // Default behavior for chat list
    const basePath = conv.chat_mode === 'chat_react_agent' ? '/' : '/chat';
    const queryPart =
      conv.chat_mode === 'chat_react_agent'
        ? `id=${conv.conv_uid}&title=${encodeURIComponent(title)}`
        : `scene=${conv.chat_mode}&id=${conv.conv_uid}&title=${encodeURIComponent(title)}`;
    router.push(`${basePath}?${queryPart}`);
  };

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditValue(title);
    setIsEditing(true);
  };

  const handleConfirmEdit = () => {
    if (editValue.trim() && editValue !== title) {
      onRename(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirmEdit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'move',
      label: '移动到分类',
      onClick: e => {
        e.domEvent.stopPropagation();
        onMoveToCategory();
      },
    },
    {
      key: 'pin',
      label: conv.is_pinned ? '取消置顶' : '置顶',
      onClick: e => {
        e.domEvent.stopPropagation();
        onPinToggle();
      },
    },
  ];

  return (
    <div
      onClick={batchMode ? () => onSelect(!selected) : handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      draggable={!batchMode}
      onDragStart={() => !batchMode && setDraggingConvUid(conv.conv_uid)}
      onDragEnd={() => {
        setDraggingConvUid(null);
        onDragEnd?.();
      }}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border border-transparent ${
        conv.is_pinned ? 'bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-400 dark:border-l-amber-500' : ''
      } ${
        isHovered
          ? 'translate-y-[-1px] shadow-md border-purple-500 dark:border-purple-400'
          : 'hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm hover:border-[var(--border-color)]'
      }`}
    >
      {batchMode && (
        <Checkbox checked={selected} onClick={e => e.stopPropagation()} onChange={e => onSelect(e.target.checked)} />
      )}

      <div className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-tertiary)]'>
        <MessageOutlined className='text-[var(--text-tertiary)] text-sm' />
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 mb-1'>
          {conv.is_pinned && (
            <PushpinOutlined className='text-amber-500 text-xs flex-shrink-0' style={{ transform: 'rotate(-45deg)' }} />
          )}
          {categoryColor && (
            <span className='px-2 py-0.5 text-xs rounded-full text-white' style={{ backgroundColor: categoryColor }}>
              {categoryName}
            </span>
          )}
          {isEditing ? (
            <input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={handleConfirmEdit}
              onClick={e => e.stopPropagation()}
              autoFocus
              className='flex-1 px-2 py-1 text-sm border border-purple-300 rounded focus:outline-none focus:border-purple-500'
            />
          ) : (
            <div className='text-sm font-medium text-[var(--text-primary)] truncate'>{title}</div>
          )}
        </div>
        <div className='text-xs text-[var(--text-tertiary)] space-y-0.5'>
          {conv.gmt_modified && <div>更新于 {formatRelativeTime(conv.gmt_modified)}</div>}
          {conv.gmt_created && <div>创建于 {formatAbsoluteTime(conv.gmt_created)}</div>}
        </div>
      </div>

      <div className='flex-shrink-0 flex items-center gap-1'>
        {!batchMode && isHovered && (
          <>
            <button
              onClick={handleStartEdit}
              className='opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--bg-hover)] rounded'
            >
              <EditOutlined className='text-[var(--text-tertiary)] hover:text-[var(--text-primary)]' />
            </button>
            <Popconfirm
              title='确认删除这条会话记录吗？'
              onConfirm={(e: any) => {
                e?.stopPropagation?.();
                onDelete();
              }}
              okText='删除'
              cancelText='取消'
              okButtonProps={{ danger: true }}
            >
              <button
                onClick={e => e.stopPropagation()}
                className='opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--bg-hover)] rounded'
              >
                <DeleteOutlined className='text-[var(--text-tertiary)] hover:text-red-500' />
              </button>
            </Popconfirm>
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement='bottomRight'>
              <button
                onClick={e => e.stopPropagation()}
                className='opacity-0 group-hover:opacity-100 p-1 hover:bg-[var(--bg-hover)] rounded'
              >
                <MoreOutlined className='text-[var(--text-tertiary)] hover:text-[var(--text-primary)]' />
              </button>
            </Dropdown>
          </>
        )}
      </div>
    </div>
  );
}

export default ConversationCard;
