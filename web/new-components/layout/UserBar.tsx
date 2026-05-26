import { STORAGE_USERINFO_KEY } from '@/utils/constants/storage';
import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, MenuProps, message } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

interface UserInfo {
  id?: number;
  login_name?: string;
  real_name?: string;
  nick_name?: string;
  email?: string;
  avatar_url?: string;
}

export default function UserBar({ onlyAvatar = false }: { onlyAvatar?: boolean }) {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_USERINFO_KEY);
    if (stored) {
      try {
        setUserInfo(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/v2/sys/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    localStorage.removeItem(STORAGE_USERINFO_KEY);
    router.push('/login');
  };

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    setMenuVisible(false);
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      message.info('个人信息功能开发中');
    } else if (key === 'password') {
      message.info('修改密码功能开发中');
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '修改密码',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出',
      danger: true,
    },
  ];

  const triggerArea = (
    <div className='flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'>
      <Avatar src={userInfo?.avatar_url} className='bg-gradient-to-tr from-[#31afff] to-[#1677ff]'>
        {userInfo?.nick_name || userInfo?.real_name || userInfo?.login_name?.[0] || '?'}
      </Avatar>
      {!onlyAvatar && (
        <span className='text-sm truncate max-w-[80px]'>
          {userInfo?.nick_name || userInfo?.real_name || userInfo?.login_name || ''}
        </span>
      )}
    </div>
  );

  return (
    <div ref={menuRef} className='flex flex-1 items-center justify-center'>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuClick }}
        trigger={['click']}
        open={menuVisible}
        onOpenChange={setMenuVisible}
        placement='topLeft'
      >
        {triggerArea}
      </Dropdown>
    </div>
  );
}
