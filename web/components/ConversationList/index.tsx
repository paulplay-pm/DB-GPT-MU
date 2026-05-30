'use client';

import {
  apiInterceptors,
  delDialogue,
  getCategoryList,
  getDialogueListPaged,
  moveConversations,
  pinDialogue,
  renameDialogue,
  unpinDialogue,
} from '@/client/api';
import { ActiveCategory } from '@/components/CategoryPanel';
import MoveCategoryModal from '@/components/MoveCategoryModal';
import { CategoryItem, IChatDialogueSchema } from '@/types/chat';
import { useRequest } from 'ahooks';
import { Pagination, Spin, message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BatchActionBar from './BatchActionBar';
import ConversationCard from './ConversationCard';
import EmptyState from './EmptyState';
import Toolbar from './Toolbar';

const PAGE_SIZE = 20;

interface ConversationListProps {
  activeCategory: ActiveCategory;
  userName: string;
  onCategoriesChange: () => void;
  listSource?: 'chat' | 'reports';
}

function ConversationList({
  activeCategory,
  userName,
  onCategoriesChange,
  listSource = 'chat',
}: ConversationListProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [list, setList] = useState<IChatDialogueSchema[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const totalRef = useRef<{
    current_page: number;
    total_count: number;
    total_pages: number;
  }>();

  // Fetch categories for move modal
  const fetchCategories = useCallback(async () => {
    const [, res] = await apiInterceptors(getCategoryList(userName));
    setCategories(res || []);
  }, [userName]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Determine filter based on active category
  // Note: "uncategorized" uses category_id=0 which backend DAO handles for IS NULL filter
  const getFilterParams = (): { is_pinned?: boolean; category_id?: number | null } => {
    if (activeCategory.type === 'system') {
      switch (activeCategory.id) {
        case 'all':
          return {};
        case 'pinned':
          return { is_pinned: true };
        case 'uncategorized':
          return { category_id: 0 }; // Backend DAO checks for 0 or "0" and uses IS NULL filter
      }
    } else {
      return { category_id: activeCategory.id as number };
    }
    return {};
  };

  const { loading, run: fetchList } = useRequest(
    async (page = 1) => {
      const filterParams = getFilterParams();
      // Only pass user_name if it has a non-empty value, otherwise backend filters out all records
      const requestData = userName && userName.trim() ? { user_name: userName, ...filterParams } : { ...filterParams };
      return await apiInterceptors(getDialogueListPaged(requestData, page, PAGE_SIZE));
    },
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

  useEffect(() => {
    fetchList(1);
  }, [activeCategory, fetchList]);

  // Filter by search keyword locally
  const filteredList = useMemo(() => {
    if (!searchKeyword.trim()) return list;
    const keyword = searchKeyword.toLowerCase();
    return list.filter(conv => {
      const title = typeof conv.user_input === 'string' ? conv.user_input.toLowerCase() : '';
      return title.includes(keyword);
    });
  }, [list, searchKeyword]);

  // Separate pinned and normal conversations
  const { pinnedList, normalList } = useMemo(() => {
    const pinned: IChatDialogueSchema[] = [];
    const normal: IChatDialogueSchema[] = [];
    filteredList.forEach(conv => {
      if (conv.is_pinned) {
        pinned.push(conv);
      } else {
        normal.push(conv);
      }
    });
    return { pinnedList: pinned, normalList: normal };
  }, [filteredList]);

  const handleDelete = useCallback(
    async (convUid: string) => {
      const [err] = await apiInterceptors(delDialogue(convUid));
      if (!err) {
        message.success('已删除');
        fetchList(totalRef.current?.current_page || 1);
      }
    },
    [fetchList],
  );

  const handlePinToggle = useCallback(async (convUid: string, isPinned: boolean) => {
    const [err] = await apiInterceptors(isPinned ? unpinDialogue(convUid) : pinDialogue(convUid));
    if (!err) {
      setList(prev => prev.map(item => (item.conv_uid === convUid ? { ...item, is_pinned: !isPinned } : item)));
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

  const handleBatchDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await apiInterceptors(delDialogue(id));
    }
    message.success(`已删除 ${ids.length} 项`);
    setBatchMode(false);
    setSelectedIds(new Set());
    fetchList(1);
  }, [selectedIds, fetchList]);

  const handleBatchPin = useCallback(async () => {
    const ids = Array.from(selectedIds);
    for (const id of ids) {
      await apiInterceptors(pinDialogue(id));
    }
    message.success(`已置顶 ${ids.length} 项`);
    setBatchMode(false);
    setSelectedIds(new Set());
    fetchList(1);
  }, [selectedIds, fetchList]);

  const handleBatchMove = useCallback(
    async (categoryId: number | null) => {
      const ids = Array.from(selectedIds);
      const [err] = await apiInterceptors(moveConversations({ conv_uids: ids, category_id: categoryId }, userName));
      if (!err) {
        message.success('移动成功');
        setMoveModalVisible(false);
        setBatchMode(false);
        setSelectedIds(new Set());
        fetchList(1);
        onCategoriesChange();
      }
    },
    [selectedIds, userName, fetchList, onCategoriesChange],
  );

  const handleMoveToCategory = useCallback(
    (convUid: string) => {
      setSelectedIds(new Set([convUid]));
      // Fetch latest categories before showing modal
      fetchCategories();
      setMoveModalVisible(true);
    },
    [fetchCategories],
  );

  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      <Toolbar
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        batchMode={batchMode}
        onBatchModeToggle={() => {
          if (batchMode) {
            setBatchMode(false);
            setSelectedIds(new Set());
          } else {
            setBatchMode(true);
          }
        }}
      />

      {batchMode && (
        <BatchActionBar
          selectedCount={selectedIds.size}
          onMove={() => {
            fetchCategories();
            setMoveModalVisible(true);
          }}
          onPin={handleBatchPin}
          onDelete={handleBatchDelete}
          onCancel={() => {
            setBatchMode(false);
            setSelectedIds(new Set());
          }}
        />
      )}

      <div className='flex-1 overflow-y-auto'>
        <Spin spinning={loading}>
          {!loading && list.length === 0 ? (
            <EmptyState />
          ) : (
            <div className='space-y-2'>
              {/* Pinned Section */}
              {pinnedList.length > 0 && (
                <>
                  {pinnedList.map(conv => (
                    <ConversationCard
                      key={conv.conv_uid}
                      conv={conv}
                      batchMode={batchMode}
                      selected={selectedIds.has(conv.conv_uid)}
                      onSelect={selected =>
                        setSelectedIds(prev => {
                          const next = new Set(prev);
                          if (selected) {
                            next.add(conv.conv_uid);
                          } else {
                            next.delete(conv.conv_uid);
                          }
                          return next;
                        })
                      }
                      onDelete={() => handleDelete(conv.conv_uid)}
                      onPinToggle={() => handlePinToggle(conv.conv_uid, !!conv.is_pinned)}
                      onRename={newSummary => handleRename(conv.conv_uid, newSummary)}
                      onMoveToCategory={() => handleMoveToCategory(conv.conv_uid)}
                      listSource={listSource}
                    />
                  ))}
                  {/* Separator */}
                  {normalList.length > 0 && (
                    <div className='flex items-center gap-4 py-2'>
                      <div className='flex-1 h-px bg-[var(--border-color)]' />
                      <span className='text-xs text-[var(--text-tertiary)]'>更早的会话</span>
                      <div className='flex-1 h-px bg-[var(--border-color)]' />
                    </div>
                  )}
                </>
              )}

              {/* Normal Section */}
              {normalList.map(conv => (
                <ConversationCard
                  key={conv.conv_uid}
                  conv={conv}
                  batchMode={batchMode}
                  selected={selectedIds.has(conv.conv_uid)}
                  onSelect={selected =>
                    setSelectedIds(prev => {
                      const next = new Set(prev);
                      if (selected) {
                        next.add(conv.conv_uid);
                      } else {
                        next.delete(conv.conv_uid);
                      }
                      return next;
                    })
                  }
                  onDelete={() => handleDelete(conv.conv_uid)}
                  onPinToggle={() => handlePinToggle(conv.conv_uid, !!conv.is_pinned)}
                  onRename={newSummary => handleRename(conv.conv_uid, newSummary)}
                  onMoveToCategory={() => handleMoveToCategory(conv.conv_uid)}
                  listSource={listSource}
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

      <MoveCategoryModal
        visible={moveModalVisible}
        categories={categories}
        selectedCount={selectedIds.size}
        onMove={handleBatchMove}
        onCancel={() => setMoveModalVisible(false)}
      />
    </div>
  );
}

export default ConversationList;
