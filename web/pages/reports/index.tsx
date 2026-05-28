'use client';

import { apiInterceptors, delDialogue, getDialogueListPaged } from '@/client/api';
import PageHeader from '@/new-components/common/PageHeader';
import Toolbar from '@/new-components/common/Toolbar';
import { IChatDialogueSchema } from '@/types/chat';
import { DeleteOutlined, MessageOutlined, SearchOutlined } from '@ant-design/icons';
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
    if (!searchKeyword.trim()) return list;
    const keyword = searchKeyword.toLowerCase();
    return list.filter(conv => {
      const title = typeof conv.user_input === 'string' ? conv.user_input.toLowerCase() : '';
      return title.includes(keyword);
    });
  }, [list, searchKeyword]);

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '';
    return moment(dateStr).fromNow();
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
                <div
                  key={conv.conv_uid}
                  onClick={() => router.push(`/?id=${conv.conv_uid}&parent=reports`)}
                  className='group flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm border border-transparent hover:border-[var(--border-color)] dark:hover:border-gray-700'
                >
                  <div className='flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-tertiary)]'>
                    <MessageOutlined className='text-[var(--text-tertiary)] text-sm' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-medium text-[var(--text-primary)] truncate'>{getTitle(conv)}</div>
                    {conv.gmt_created && (
                      <div className='text-xs text-[var(--text-tertiary)] mt-0.5'>{formatTime(conv.gmt_created)}</div>
                    )}
                  </div>
                  <Popconfirm
                    title='确认删除这条会话记录吗？'
                    onConfirm={e => handleDelete(e as React.MouseEvent, conv.conv_uid)}
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
                </div>
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

export default ReportsPage;
