'use client';

import { usePermission } from '@/context/PermissionContext';
import UserBar from '@/new-components/layout/UserBar';
import { STORAGE_VERSION_KEY, UI_VERSION_NEW, UI_VERSION_OLD } from '@/utils/constants';
import {
  ApartmentOutlined,
  AppstoreOutlined,
  BookOutlined,
  DatabaseOutlined,
  EditOutlined,
  FileTextOutlined,
  GlobalOutlined,
  KeyOutlined,
  LineChartOutlined,
  MessageOutlined,
  SafetyOutlined,
  StarOutlined,
  TeamOutlined,
  ToolOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Badge, Segmented } from 'antd';
import cls from 'classnames';
import { useRouter } from 'next/router';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NAV_GROUPS, NavItem, PERMISSION_KEYS } from './config';

// Icon mapping - maps icon string names to Ant Design icon components
const ICON_MAP: Record<string, ReactNode> = {
  MessageOutlined: <MessageOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  StarOutlined: <StarOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  TeamOutlined: <TeamOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  BookOutlined: <BookOutlined />,
  ToolOutlined: <ToolOutlined />,
  EditOutlined: <EditOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  LineChartOutlined: <LineChartOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  UserAddOutlined: <UserAddOutlined />,
  UserOutlined: <UserOutlined />,
  KeyOutlined: <KeyOutlined />,
  SafetyOutlined: <SafetyOutlined />,
};

// Item display component
function NavMenuItem({
  item,
  isActive,
  badgeCount,
  onNavigate,
  t,
}: {
  item: NavItem;
  isActive: boolean;
  badgeCount?: number;
  onNavigate: (path: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const icon = ICON_MAP[item.icon] || <AppstoreOutlined />;

  return (
    <div
      className={cls(
        'group relative flex items-center h-11 px-4 cursor-pointer transition-all duration-200 rounded-lg mx-2',
        'hover:bg-primary-light/50',
        {
          'bg-primary-light/30': isActive,
        },
      )}
      onClick={() => onNavigate(item.path)}
    >
      {/* Active indicator - blue vertical line on left */}
      {isActive && <div className='absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r' />}

      {/* Icon */}
      <span
        className={cls(
          'text-lg mr-3 transition-colors duration-200',
          isActive ? 'text-primary' : 'text-gray-500 group-hover:text-gray-700',
        )}
      >
        {icon}
      </span>

      {/* Label */}
      <span
        className={cls(
          'text-sm font-medium transition-colors duration-200',
          isActive ? 'text-primary' : 'text-gray-600 group-hover:text-gray-900',
        )}
      >
        {t(item.label)}
      </span>

      {/* Badge for pending count */}
      {item.key === 'registration' && badgeCount !== undefined && badgeCount > 0 && (
        <Badge
          count={badgeCount}
          style={{
            marginLeft: 8,
          }}
        />
      )}
    </div>
  );
}

// Group section with title
function NavGroupSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className='mb-4'>
      <div className='px-4 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider'>{title}</div>
      <div className='space-y-0.5'>{children}</div>
    </div>
  );
}

// Fetch pending registration count
async function fetchPendingRegistrationCount(): Promise<number> {
  try {
    const res = await fetch('/api/v2/sys/registrations?status=pending', {
      credentials: 'include',
    });
    const data = await res.json();
    if (data?.success && Array.isArray(data?.data)) {
      return data.data.length;
    }
    return 0;
  } catch {
    return 0;
  }
}

export default function NewSideBar() {
  const router = useRouter();
  const { pathname } = router;
  const { t } = useTranslation();
  const { hasPermission } = usePermission();

  const [pendingCount, setPendingCount] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [uiVersion, setUiVersion] = useState(localStorage.getItem(STORAGE_VERSION_KEY) || UI_VERSION_NEW);

  const handleVersionToggle = (version: string) => {
    localStorage.setItem(STORAGE_VERSION_KEY, version);
    setUiVersion(version);
    if (version === UI_VERSION_NEW) {
      router.push('/');
    } else {
      router.push('/chat');
    }
  };

  // Fetch pending registration count for badge
  useEffect(() => {
    const loadPendingCount = async () => {
      // Only fetch if user has permission to see registration review
      if (hasPermission(PERMISSION_KEYS.REGISTRATION_REVIEW)) {
        const count = await fetchPendingRegistrationCount();
        setPendingCount(count);
      }
    };
    loadPendingCount();

    // Refresh every 60 seconds
    const interval = setInterval(loadPendingCount, 60000);
    return () => clearInterval(interval);
  }, [hasPermission]);

  // Handle navigation
  const handleNavigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router],
  );

  // Check if item path is active
  const isItemActive = useCallback(
    (itemPath: string): boolean => {
      if (itemPath === '/') {
        return pathname === '/';
      }
      return pathname.startsWith(itemPath);
    },
    [pathname],
  );

  // Check if user has permission for item
  const canShowItem = useCallback(
    (item: NavItem): boolean => {
      if (!item.permission) {
        return true;
      }
      return hasPermission(item.permission);
    },
    [hasPermission],
  );

  // Filter items by permission and group by title
  const renderNavGroups = () => {
    return NAV_GROUPS.map(group => {
      const visibleItems = group.items.filter(item => canShowItem(item));

      if (visibleItems.length === 0) {
        return null;
      }

      return (
        <NavGroupSection
          key={group.title}
          title={t(group.title as Parameters<typeof t>[0], { defaultValue: group.title })}
        >
          {visibleItems.map(item => (
            <NavMenuItem
              key={item.key}
              item={item}
              isActive={isItemActive(item.path)}
              badgeCount={item.key === 'registration' ? pendingCount : undefined}
              onNavigate={handleNavigate}
              t={t}
            />
          ))}
        </NavGroupSection>
      );
    });
  };

  // Toggle collapsed state
  const handleToggleCollapse = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  if (collapsed) {
    return (
      <div className='flex flex-col h-screen w-16 min-w-16 bg-white dark:bg-[#232734] border-r border-gray-200 dark:border-gray-700'>
        {/* Logo area */}
        <div className='flex flex-col items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 gap-1'>
          <div className='text-lg font-bold text-primary'>DB</div>
          <Segmented
            value={uiVersion}
            onChange={val => handleVersionToggle(val as string)}
            options={[
              { label: '新', value: UI_VERSION_NEW },
              { label: '老', value: UI_VERSION_OLD },
            ]}
            size='small'
            style={{ height: 20, fontSize: 10 }}
          />
        </div>

        {/* Collapsed nav items */}
        <div className='flex-1 overflow-y-auto py-4'>
          {NAV_GROUPS.map(group => {
            const visibleItems = group.items.filter(item => canShowItem(item));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className='mb-4'>
                {visibleItems.map(item => {
                  const icon = ICON_MAP[item.icon] || <AppstoreOutlined />;
                  const isActive = isItemActive(item.path);

                  return (
                    <div
                      key={item.key}
                      className={cls(
                        'relative flex items-center justify-center h-12 cursor-pointer transition-all duration-200',
                        'hover:bg-primary-light/50',
                        {
                          'bg-primary-light/30': isActive,
                        },
                      )}
                      onClick={() => handleNavigate(item.path)}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className='absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r' />
                      )}

                      <span
                        className={cls(
                          'text-xl transition-colors duration-200',
                          isActive ? 'text-primary' : 'text-gray-500',
                        )}
                      >
                        {icon}
                      </span>

                      {/* Badge */}
                      {item.key === 'registration' && pendingCount > 0 && (
                        <Badge
                          count={pendingCount}
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* UserBar and toggle */}
        <div className='p-2 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-center mb-2'>
            <div
              className='flex items-center justify-center w-8 h-8 cursor-pointer text-gray-500 hover:text-gray-700 rounded transition-colors'
              onClick={handleToggleCollapse}
            >
              <AppstoreOutlined />
            </div>
          </div>
          <div className='flex justify-center'>
            <UserBar onlyAvatar />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-screen w-60 min-w-60 bg-white dark:bg-[#232734] border-r border-gray-200 dark:border-gray-700'>
      {/* Header with logo */}
      <div className='flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700'>
        <div className='flex items-center gap-3'>
          <div className='w-8 h-8 bg-gradient-to-br from-[#31afff] to-[#1677ff] rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>DB</span>
          </div>
          <span className='font-semibold text-gray-800 dark:text-gray-200'>DB-GPT</span>
          <Segmented
            value={uiVersion}
            onChange={val => handleVersionToggle(val as string)}
            options={[
              { label: '新', value: UI_VERSION_NEW },
              { label: '老', value: UI_VERSION_OLD },
            ]}
            size='small'
          />
        </div>
        <div
          className='flex items-center justify-center w-7 h-7 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300 rounded transition-colors'
          onClick={handleToggleCollapse}
        >
          <AppstoreOutlined style={{ fontSize: 14 }} />
        </div>
      </div>

      {/* Navigation groups */}
      <div className='flex-1 overflow-y-auto px-2 py-4'>{renderNavGroups()}</div>

      {/* Footer with UserBar */}
      <div className='p-3 border-t border-gray-200 dark:border-gray-700'>
        <div className='flex items-center gap-2 px-2 py-2 bg-gray-50 dark:bg-[#2d323f] rounded-lg'>
          <UserBar />
        </div>
      </div>
    </div>
  );
}
