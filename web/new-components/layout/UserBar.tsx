import { STORAGE_USERINFO_KEY } from '@/utils/constants/storage';
import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Dropdown, Form, Input, MenuProps, Modal, message } from 'antd';
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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
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
      form.setFieldsValue({ real_name: userInfo?.real_name, email: userInfo?.email });
      setProfileModalOpen(true);
    } else if (key === 'password') {
      passwordForm.resetFields();
      setPasswordModalOpen(true);
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
      <Modal
        title='个人信息'
        open={profileModalOpen}
        onCancel={() => setProfileModalOpen(false)}
        onOk={() => {
          form.validateFields().then(async values => {
            try {
              const res = await fetch('/api/v2/sys/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
                credentials: 'include',
              });
              const data = await res.json();
              if (data.success) {
                const updated = { ...userInfo, ...values };
                localStorage.setItem(STORAGE_USERINFO_KEY, JSON.stringify(updated));
                setUserInfo(updated);
                setProfileModalOpen(false);
                message.success('个人信息已更新');
              } else {
                message.error(data.detail || '更新失败');
              }
            } catch {
              message.error('更新失败');
            }
          });
        }}
      >
        <Form form={form} layout='vertical'>
          <Form.Item label='登录名'>
            <Input value={userInfo?.login_name || ''} disabled />
          </Form.Item>
          <Form.Item name='real_name' label='真实姓名'>
            <Input />
          </Form.Item>
          <Form.Item name='email' label='邮箱'>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title='修改密码'
        open={passwordModalOpen}
        onCancel={() => setPasswordModalOpen(false)}
        onOk={() => {
          passwordForm.validateFields().then(async values => {
            if (values.new_password !== values.confirm_password) {
              message.error('两次输入的密码不一致');
              return;
            }
            try {
              const res = await fetch('/api/v2/sys/auth/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  old_password: values.old_password,
                  new_password: values.new_password,
                }),
                credentials: 'include',
              });
              const data = await res.json();
              if (data.success) {
                setPasswordModalOpen(false);
                message.success('密码已更新');
                passwordForm.resetFields();
              } else {
                message.error(data.detail || '修改失败');
              }
            } catch {
              message.error('修改失败');
            }
          });
        }}
      >
        <Form form={passwordForm} layout='vertical'>
          <Form.Item name='old_password' label='原密码' rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name='new_password' label='新密码' rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name='confirm_password' label='确认密码' rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
