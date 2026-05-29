'use client';

import {
  apiInterceptors,
  delDialogue,
  getDialogueListPaged,
  pinDialogue,
  renameDialogue,
  unpinDialogue,
} from '@/client/api';
import PageHeader from '@/new-components/common/PageHeader';
import Toolbar from '@/new-components/common/Toolbar';
import { IChatDialogueSchema } from '@/types/chat';
import { DeleteOutlined, EditOutlined, MessageOutlined, PushpinOutlined, SearchOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Empty, Input, Pagination, Popconfirm, Spin, Tabs, Tooltip, message } from 'antd';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20;

function ReportsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'reports' | 'conversations'>('reports');
  const [searchKeyword, setSearchKeyword] = useState('');

  const tabItems: { key: string; label: React.ReactNode }[] = [
    { key: 'reports', label: t('reports') || '我的报告' },
    { key: 'conversations', label: '会话记录' },
  ];

  return (
    <div className='flex flex-col h-full w-full px-6 py-4'>
      <PageHeader title={t('reports') || '我的报告'} description={t('reports_desc') || '查看和管理您的分析报告'} />
      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as 'reports' | 'conversations')}
        items={tabItems}
        className='mb-4'
      />
      {activeTab === 'reports' ? (
        <ReportsTab t={t} />
      ) : (
        <ConversationsTab t={t} searchKeyword={searchKeyword} onSearchChange={setSearchKeyword} />
      )}
    </div>
  );
}

function ReportsTab({ t }: { t: any }) {
  return (
    <>
      <Toolbar searchPlaceholder={t('reports_search') || '搜索报告...'} />
      <div className='flex-1 flex items-center justify-center'>
        <Empty description={t('reports_empty') || '暂无报告'} className='py-16' />
      </div>
    </>
  );
}

function ConversationsTab({
  t,
  searchKeyword,
  onSearchChange,
}: {
  t: any;
  searchKeyword: string;
  onSearchChange: (val: string) => void;
}) {
  const router = useRouter();
  const [list, setList] = useState<IChatDialogueSchema[]>([]);
  const totalRef = useRef<{ current_page: number; total_count: number; total_pages: number }>();

  const { loading, run: fetchList } = useRequest(
    async (page = 1) => await apiInterceptors(getDialogueListPaged({ chat_mode: 'chat_react_agent' }, page, PAGE_SIZE)),
    {
      defaultParams: [1],
      onSuccess: data => {
        const [, res] = data;
        setList(res?.items || []);
        totalRef.current = {
          current_page: res?.page || 1,
          total_count: res?.total_count || 0,
          total_pages: res?.total_pages || 0,
        };
      },
    },
  );

  const filteredList = useMemo(() => {
    const sortedList = [...list].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      const timeA = a.gmt_modified ? new Date(a.gmt_modified).getTime() : 0;
      const timeB = b.gmt_modified ? new Date(b.gmt_modified).getTime() : 0;
      return timeB - timeA;
    });
    if (!searchKeyword.trim()) return sortedList;
    const keyword = searchKeyword.toLowerCase();
    return sortedList.filter(conv => {
      const title = typeof conv.user_input === 'string' ? conv.user_input.toLowerCase() : '';
      return title.includes(keyword);
    });
  }, [list, searchKeyword]);

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    return moment(dateStr).fromNow();
  };

  const formatAbsoluteTime = (dateStr?: string) => {
    if (!dateStr) return '';
    return moment(dateStr).format('YYYY-MM-DD HH:mm');
  };

  const getTitle = (conv: IChatDialogueSchema) => {
    if (typeof conv.user_input === 'string' && conv.user_input.trim()) {
      return conv.user_input;
    }
    return t('new_task') || '新对话';
  };

  const handleDelete = useCallback(
    async (e: React.MouseEvent, convUid: string) => {
      e.stopPropagation();
      e.preventDefault();
      const [err] = await apiInterceptors(delDialogue(convUid));
      if (!err) {
        message.success('已删除');
        const current = totalRef.current;
        if (current) {
          const remaining = current.total_count - 1;
          const maxPage = Math.max(1, Math.ceil(remaining / PAGE_SIZE));
          fetchList(Math.min(current.current_page, maxPage));
        }
      }
    },
    [fetchList],
  );

  const handlePinToggle = useCallback(async (e: React.MouseEvent, conv: IChatDialogueSchema) => {
    e.stopPropagation();
    e.preventDefault();
    const [err] = await apiInterceptors(conv.is_pinned ? unpinDialogue(conv.conv_uid) : pinDialogue(conv.conv_uid));
    if (!err) {
      setList(prev =>
        prev.map(item => (item.conv_uid === conv.conv_uid ? { ...item, is_pinned: !conv.is_pinned } : item)),
      );
    }
  }, []);

  const handleRename = useCallback(async (convUid: string, newSummary: string) => {
    const [err] = await apiInterceptors(renameDialogue(convUid, newSummary));
    if (!err) {
      setList(prev => prev.map(item => (item.conv_uid === convUid ? { ...item, user_input: newSummary } : item)));
      message.success('重命名成功');
      return true;
    }
    return false;
  }, []);

  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      <div className='flex items-center gap-3 mb-4'>
        <Input
          variant='filled'
          prefix={<SearchOutlined />}
          placeholder={t('favorites_search') || '搜索会话...'}
          value={searchKeyword}
          onChange={e => onSearchChange(e.target.value)}
          allowClear
          className='w-[230px]'
        />
        <span className='text-sm text-[var(--text-tertiary)]'>
          {totalRef.current ? `共 ${totalRef.current.total_count} 条` : ''}
        </span>
      </div>
      <div className='flex-1 overflow-y-auto'>
        <Spin spinning={loading}>
          {!loading && list.length === 0 ? (
            <Empty description={t('no_tasks') || '暂无历史记录'} className='py-16' />
          ) : !loading && filteredList.length === 0 ? (
            <Empty description='没有匹配的会话' className='py-16' />
          ) : (
            <div className='space-y-2'>
              {filteredList.map(conv => (
                <ConversationItem
                  key={conv.conv_uid}
                  conv={conv}
                  t={t}
                  getTitle={getTitle}
                  formatRelativeTime={formatRelativeTime}
                  formatAbsoluteTime={formatAbsoluteTime}
                  onDelete={handleDelete}
                  onPinToggle={handlePinToggle}
                  onRename={handleRename}
                  onClick={() =>
                    router.push(`/?id=${conv.conv_uid}&title=${encodeURIComponent(getTitle(conv))}&parent=reports`)
                  }
                />
              ))}
            </div>
          )}
        </Spin>
      </div>
      {(totalRef.current?.total_count ?? 0) > PAGE_SIZE && (
        <div className='flex justify-end pt-4 border-t border-[var(--border-color)]'>
          <Pagination
            current={totalRef.current?.current_page}
            total={totalRef.current?.total_count || 0}
            pageSize={PAGE_SIZE}
            showSizeChanger={false}
            showTotal={total => `共 ${total} 条`}
            onChange={page => fetchList(page)}
          />
        </div>
      )}
    </div>
  );
}

function ConversationItem({
  conv,
  t,
  getTitle,
  formatRelativeTime,
  formatAbsoluteTime,
  onDelete,
  onPinToggle,
  onRename,
  onClick,
}: {
  conv: IChatDialogueSchema;
  t: any;
  getTitle: (conv: IChatDialogueSchema) => string;
  formatRelativeTime: (dateStr?: string) => string;
  formatAbsoluteTime: (dateStr?: string) => string;
  onDelete: (e: React.MouseEvent, convUid: string) => void;
  onPinToggle: (e: React.MouseEvent, conv: IChatDialogueSchema) => void;
  onRename: (convUid: string, newSummary: string) => Promise<boolean>;
  onClick: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(getTitle(conv));
  const inputRef = useRef<any>(null);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditValue(getTitle(conv));
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleConfirmEdit = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    e?.preventDefault();
    if (editValue.trim() && editValue !== getTitle(conv)) {
      const success = await onRename(conv.conv_uid, editValue.trim());
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(false);
    setEditValue(getTitle(conv));
  };

  const title = getTitle(conv);

  return (
    <div
      onClick={isEditing ? undefined : onClick}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm border border-transparent hover:border-[var(--border-color)] dark:hover:border-gray-700${conv.is_pinned ? ' bg-amber-50 dark:bg-amber-900/10 border-l-4 border-l-amber-400 dark:border-l-amber-500' : ''}`}
    >
      <div className='flex-shrink-0'>
        <Tooltip title={conv.is_pinned ? '取消置顶' : '置顶'}>
          <PushpinOutlined
            className={`text-sm cursor-pointer transition-colors ${conv.is_pinned ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100'} hover:text-[var(--text-primary)]`}
            onClick={e => onPinToggle(e, conv)}
            style={{ transform: conv.is_pinned ? 'rotate(-45deg)' : 'none' }}
          />
        </Tooltip>
      </div>
      <div className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-tertiary)]'>
        <MessageOutlined className='text-[var(--text-tertiary)] text-sm' />
      </div>
      <div className='flex-1 min-w-0'>
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onPressEnter={handleConfirmEdit}
            onClick={e => e.stopPropagation()}
            size='small'
            className='mb-1'
          />
        ) : (
          <div className='text-sm font-medium text-[var(--text-primary)] truncate'>{title}</div>
        )}
        <div className='text-xs text-[var(--text-tertiary)] space-y-0.5'>
          {conv.gmt_modified && (
            <div>
              {t('update_time') || '更新'}: {formatRelativeTime(conv.gmt_modified)}
            </div>
          )}
          {conv.gmt_created && (
            <div>
              {t('created_at') || '创建'}: {formatAbsoluteTime(conv.gmt_created)}
            </div>
          )}
        </div>
      </div>
      <div className='flex-shrink-0 flex items-center gap-1'>
        {isEditing ? (
          <>
            <Tooltip title='确认'>
              <div
                className='opacity-100 p-1 hover:bg-[var(--bg-hover)] rounded cursor-pointer text-blue-500'
                onClick={handleConfirmEdit}
              >
                <span className='text-xs'>确认</span>
              </div>
            </Tooltip>
            <Tooltip title='取消'>
              <div
                className='opacity-100 p-1 hover:bg-[var(--bg-hover)] rounded cursor-pointer text-gray-500'
                onClick={handleCancelEdit}
              >
                <span className='text-xs'>取消</span>
              </div>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title='重命名'>
              <div
                className='flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--bg-hover)] rounded cursor-pointer'
                onClick={handleStartEdit}
              >
                <EditOutlined className='text-[var(--text-tertiary)] hover:text-[var(--text-primary)]' />
              </div>
            </Tooltip>
            <Popconfirm
              title='确认删除这条会话记录吗？'
              onConfirm={e => onDelete(e as React.MouseEvent, conv.conv_uid)}
              onCancel={e => {
                e?.stopPropagation();
                e?.preventDefault();
              }}
              okText='删除'
              cancelText='取消'
              okButtonProps={{ danger: true }}
            >
              <Tooltip title='删除'>
                <div
                  className='flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-[var(--bg-hover)] rounded cursor-pointer'
                  onClick={e => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <DeleteOutlined className='text-[var(--text-tertiary)] hover:text-red-500' />
                </div>
              </Tooltip>
            </Popconfirm>
          </>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
