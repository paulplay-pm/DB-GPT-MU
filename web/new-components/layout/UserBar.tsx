import { STORAGE_LANG_KEY, STORAGE_THEME_KEY, STORAGE_USERINFO_KEY } from '@/utils/constants/storage';
import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Divider, Form, Input, Menu, MenuProps, Modal, Progress, message } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserInfo {
  id?: number;
  login_name?: string;
  real_name?: string;
  nick_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

export default function UserBar({ onlyAvatar = false }: { onlyAvatar?: boolean }) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem(STORAGE_LANG_KEY) || 'zh');
  const [theme, setTheme] = useState(localStorage.getItem(STORAGE_THEME_KEY) || 'light');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const _menuRef = useRef<HTMLDivElement>(null);

  // Password strength calculation
  const getPasswordStrength = (password: string): { level: number; percent: number; label: string } => {
    if (!password) return { level: 0, percent: 0, label: '' };
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    let label = '';
    if (strength <= 25) label = '弱';
    else if (strength <= 50) label = '中等';
    else if (strength <= 75) label = '良好';
    else label = '强';
    return { level: strength, percent: Math.min(strength, 100), label };
  };

  useEffect(() => {
    console.log('UserBar rendered, build time: 2026-05-26-20:30');
  }, []);

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
  const handleMenuToggle = () => {
    console.log('toggle menu, current:', menuVisible);
    setMenuVisible(!menuVisible);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const trigger = document.getElementById('user-avatar-trigger');
      const menu = document.getElementById('user-dropdown-menu');
      if (trigger && trigger.contains(e.target as Node)) return;
      if (menu && menu.contains(e.target as Node)) return;
      setMenuVisible(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    fetch('/api/v2/sys/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
      .then(() => {
        localStorage.removeItem(STORAGE_USERINFO_KEY);
        router.push('/login');
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_USERINFO_KEY);
        router.push('/login');
      });
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => {
        setMenuVisible(false);
        form.setFieldsValue({ real_name: userInfo?.real_name, email: userInfo?.email, phone: userInfo?.phone });
        setProfileModalOpen(true);
      },
    },
    {
      key: 'password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => {
        setMenuVisible(false);
        passwordForm.resetFields();
        setPasswordModalOpen(true);
      },
    },
    { type: 'divider' },
    {
      key: 'language',
      label: (
        <div className='flex items-center justify-between w-full px-1'>
          <span className='text-sm'>语言</span>
          <div className='flex gap-1'>
            <button
              className={`px-2 py-0.5 text-xs rounded ${lang === 'zh' ? 'bg-primary text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]'}`}
              onClick={e => {
                e.stopPropagation();
                setLang('zh');
                localStorage.setItem(STORAGE_LANG_KEY, 'zh');
                i18n.changeLanguage('zh');
              }}
            >
              中文
            </button>
            <button
              className={`px-2 py-0.5 text-xs rounded ${lang === 'en' ? 'bg-primary text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]'}`}
              onClick={e => {
                e.stopPropagation();
                setLang('en');
                localStorage.setItem(STORAGE_LANG_KEY, 'en');
                i18n.changeLanguage('en');
              }}
            >
              EN
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'theme',
      label: (
        <div className='flex items-center justify-between w-full px-1'>
          <span className='text-sm'>主题</span>
          <div className='flex gap-1'>
            <button
              className={`px-2 py-0.5 text-xs rounded ${theme === 'light' ? 'bg-primary text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]'}`}
              onClick={e => {
                e.stopPropagation();
                setTheme('light');
                localStorage.setItem(STORAGE_THEME_KEY, 'light');
                document.body?.classList?.remove('dark');
                document.body?.classList?.add('light');
              }}
            >
              浅色
            </button>
            <button
              className={`px-2 py-0.5 text-xs rounded ${theme === 'dark' ? 'bg-primary text-white' : 'bg-[var(--bg-tertiary)] hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]'}`}
              onClick={e => {
                e.stopPropagation();
                setTheme('dark');
                localStorage.setItem(STORAGE_THEME_KEY, 'dark');
                document.body?.classList?.remove('light');
                document.body?.classList?.add('dark');
              }}
            >
              深色
            </button>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出',
      danger: true,
      onClick: () => {
        setMenuVisible(false);
        handleLogout();
      },
    },
  ];

  const triggerArea = (
    <div
      id='user-avatar-trigger'
      className='flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
      onClick={handleMenuToggle}
    >
      <Avatar src={userInfo?.avatar_url} className='bg-gradient-to-tr from-[#31afff] to-[#1677ff]'>
        {userInfo?.real_name?.[0] || userInfo?.nick_name?.[0] || userInfo?.login_name?.[0] || '?'}
      </Avatar>
      {!onlyAvatar && (
        <span className='text-sm truncate max-w-[80px]'>
          {userInfo?.nick_name || userInfo?.real_name || userInfo?.login_name || ''}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      {triggerArea}
      <div
        id='user-dropdown-menu'
        style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: 120,
          display: menuVisible ? 'block' : 'none',
        }}
      >
        <Menu mode='vertical' items={menuItems} style={{ border: 'none', boxShadow: 'none' }} />
      </div>
      <Modal
        title={
          <span className='flex items-center gap-2'>
            <UserOutlined className='text-[#1677ff]' />
            <span>个人信息</span>
          </span>
        }
        open={profileModalOpen}
        onCancel={() => setProfileModalOpen(false)}
        okText='保存'
        cancelText='取消'
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
        <div className='flex gap-6 py-4'>
          <div className='flex flex-col items-center gap-3 min-w-[100px]'>
            <Avatar src={userInfo?.avatar_url} size={72} className='bg-gradient-to-tr from-[#31afff] to-[#1677ff]'>
              {userInfo?.real_name?.[0] || userInfo?.nick_name?.[0] || userInfo?.login_name?.[0] || '?'}
            </Avatar>
            <span className='text-xs text-gray-400'>点击更换头像</span>
          </div>
          <Divider type='vertical' className='h-full my-0' />
          <div className='flex-1'>
            <Form form={form} layout='vertical' size='middle'>
              <Form.Item label='登录账号'>
                <Input value={userInfo?.login_name || ''} disabled className='bg-gray-50' />
              </Form.Item>
              <Form.Item name='real_name' label='真实姓名' rules={[{ required: true, message: '请输入真实姓名' }]}>
                <Input placeholder='请输入真实姓名' />
              </Form.Item>
              <Form.Item
                name='email'
                label='邮箱'
                rules={[
                  { type: 'email', message: '请输入有效的邮箱地址' },
                  { required: true, message: '请输入邮箱' },
                ]}
              >
                <Input placeholder='请输入邮箱' />
              </Form.Item>
              <Form.Item name='phone' label='手机号'>
                <Input placeholder='请输入手机号' />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
      <Modal
        title={
          <span className='flex items-center gap-2'>
            <LockOutlined className='text-[#1677ff]' />
            <span>修改密码</span>
          </span>
        }
        open={passwordModalOpen}
        onCancel={() => setPasswordModalOpen(false)}
        okText='确认修改'
        cancelText='取消'
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
        <div className='py-4'>
          <Form form={passwordForm} layout='vertical' size='middle'>
            <Form.Item name='old_password' label='当前密码' rules={[{ required: true, message: '请输入当前密码' }]}>
              <Input.Password placeholder='请输入当前密码' />
            </Form.Item>
            <Form.Item
              name='new_password'
              label='新密码'
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password
                placeholder='请输入新密码'
                onChange={e => {
                  const strength = getPasswordStrength(e.target.value);
                  passwordForm.setFieldsValue({ passwordStrength: strength });
                }}
              />
            </Form.Item>
            {passwordForm.getFieldValue('new_password') && (
              <div className='mb-4 -mt-2'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-xs text-gray-500'>密码强度：</span>
                  <span
                    className={`text-xs font-medium ${
                      getPasswordStrength(passwordForm.getFieldValue('new_password') || '').level <= 25
                        ? 'text-red-500'
                        : getPasswordStrength(passwordForm.getFieldValue('new_password') || '').level <= 50
                          ? 'text-orange-500'
                          : getPasswordStrength(passwordForm.getFieldValue('new_password') || '').level <= 75
                            ? 'text-blue-500'
                            : 'text-green-500'
                    }`}
                  >
                    {getPasswordStrength(passwordForm.getFieldValue('new_password') || '').label}
                  </span>
                </div>
                <Progress
                  percent={getPasswordStrength(passwordForm.getFieldValue('new_password') || '').percent}
                  size='small'
                  showInfo={false}
                  strokeColor={
                    getPasswordStrength(passwordForm.getFieldValue('new_password') || '').level <= 25
                      ? '#ef4444'
                      : getPasswordStrength(passwordForm.getFieldValue('new_password') || '').level <= 50
                        ? '#f97316'
                        : getPasswordStrength(passwordForm.getFieldValue('new_password') || '').level <= 75
                          ? '#3b82f6'
                          : '#22c55e'
                  }
                />
              </div>
            )}
            <Form.Item name='confirm_password' label='确认新密码' rules={[{ required: true, message: '请确认新密码' }]}>
              <Input.Password placeholder='请再次输入新密码' />
            </Form.Item>
          </Form>
          <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
            <div className='text-xs text-gray-500 mb-2'>密码要求：</div>
            <ul className='text-xs text-gray-400 space-y-1'>
              <li>• 至少6位字符</li>
              <li>• 建议包含大小写字母、数字和特殊字符</li>
              <li>• 不要使用与其他网站相同的密码</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
