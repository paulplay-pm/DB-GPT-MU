import { STORAGE_LANG_KEY, STORAGE_THEME_KEY, STORAGE_USERINFO_KEY } from '@/utils/constants/storage';
import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Divider, Form, Input, Menu, MenuProps, Modal, Progress, message } from 'antd';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const { t, i18n } = useTranslation();
  const [userInfo, setUserInfo] = useState<UserInfo>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem(STORAGE_LANG_KEY) || 'zh');
  const [theme, setTheme] = useState(localStorage.getItem(STORAGE_THEME_KEY) || 'light');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const _menuRef = useRef<HTMLDivElement>(null);

  // Check actual body class for theme (always reflects current state)
  const isDark = () => document.body.classList.contains('dark');
  const isLight = () => document.body.classList.contains('light');

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
    if (strength <= 25) label = t('weak');
    else if (strength <= 50) label = t('medium');
    else if (strength <= 75) label = t('good');
    else label = t('strong');
    return { level: strength, percent: Math.min(strength, 100), label };
  };

  // Sync theme state with actual body class on mount and when body class changes
  useEffect(() => {
    // Read current theme from body class
    const getCurrentTheme = () => {
      const body = document.body;
      if (body.classList.contains('dark') && !body.classList.contains('light')) return 'dark';
      if (body.classList.contains('light') && !body.classList.contains('dark')) return 'light';
      return localStorage.getItem(STORAGE_THEME_KEY) || 'light';
    };

    const syncTheme = () => {
      const currentTheme = getCurrentTheme();
      setTheme(currentTheme);
      localStorage.setItem(STORAGE_THEME_KEY, currentTheme);
    };

    // Initial sync
    syncTheme();

    // Watch for body class changes
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Sync lang state with i18n events
  useEffect(() => {
    const handleLanguageChange = () => {
      const currentLang = i18n.language?.startsWith('en') ? 'en' : 'zh';
      const storedLang = localStorage.getItem(STORAGE_LANG_KEY) || 'zh';
      // Sync localStorage if needed
      if (storedLang !== currentLang) {
        localStorage.setItem(STORAGE_LANG_KEY, currentLang);
      }
      // Only update state if different (avoid infinite loop)
      setLang(currentLang);
    };

    // Initial sync
    handleLanguageChange();

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Load user info
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

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: t('profile'),
        onClick: () => {
          setMenuVisible(false);
          form.setFieldsValue({ real_name: userInfo?.real_name, email: userInfo?.email, phone: userInfo?.phone });
          setProfileModalOpen(true);
        },
      },
      {
        key: 'password',
        icon: <LockOutlined />,
        label: t('change_password'),
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
            <span className={`text-sm ${theme === 'dark' ? 'text-[#f0f0f0]' : 'text-[#1f1f1f]'}`}>{t('language')}</span>
            <div className='flex gap-1'>
              <button
                className={`px-2 py-0.5 text-xs rounded ${i18n.language?.startsWith('zh') ? theme === 'dark' ? 'bg-[#1890ff] text-white' : 'bg-[#1890ff] text-white' : theme === 'dark' ? 'bg-[#2d2e36] hover:bg-[#3d3e46] text-[#b0b0b0]' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#666666]'}`}
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
                className={`px-2 py-0.5 text-xs rounded ${i18n.language?.startsWith('en') ? theme === 'dark' ? 'bg-[#1890ff] text-white' : 'bg-[#1890ff] text-white' : theme === 'dark' ? 'bg-[#2d2e36] hover:bg-[#3d3e46] text-[#b0b0b0]' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#666666]'}`}
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
            <span className={`text-sm ${theme === 'dark' ? 'text-[#f0f0f0]' : 'text-[#1f1f1f]'}`}>{t('Theme')}</span>
            <div className='flex gap-1'>
              <button
                className={`px-2 py-0.5 text-xs rounded ${theme === 'light' ? 'bg-[#1890ff] text-white' : theme === 'dark' ? 'bg-[#2d2e36] hover:bg-[#3d3e46] text-[#b0b0b0]' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#666666]'}`}
                onClick={e => {
                  e.stopPropagation();
                  setTheme('light');
                  localStorage.setItem(STORAGE_THEME_KEY, 'light');
                  document.body?.classList?.remove('dark');
                  document.body?.classList?.add('light');
                }}
              >
                {t('light')}
              </button>
              <button
                className={`px-2 py-0.5 text-xs rounded ${theme === 'dark' ? 'bg-[#1890ff] text-white' : theme === 'dark' ? 'bg-[#2d2e36] hover:bg-[#3d3e46] text-[#b0b0b0]' : 'bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#666666]'}`}
                onClick={e => {
                  e.stopPropagation();
                  setTheme('dark');
                  localStorage.setItem(STORAGE_THEME_KEY, 'dark');
                  document.body?.classList?.remove('light');
                  document.body?.classList?.add('dark');
                }}
              >
                {t('dark')}
              </button>
            </div>
          </div>
        ),
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: t('logout'),
        danger: true,
        onClick: () => {
          setMenuVisible(false);
          handleLogout();
        },
      },
    ],
    [i18n.language, theme],
  );

  const triggerArea = (
    <div
      id='user-avatar-trigger'
      className={`flex items-center gap-2 cursor-pointer px-2 py-1 rounded ${theme === 'dark' ? 'hover:bg-[#3d3e46]' : 'hover:bg-[#f0f0f0]'}`}
      onClick={handleMenuToggle}
    >
      <Avatar src={userInfo?.avatar_url} className='bg-gradient-to-tr from-[#31afff] to-[#1677ff]'>
        {userInfo?.real_name?.[0] || userInfo?.nick_name?.[0] || userInfo?.login_name?.[0] || '?'}
      </Avatar>
      {!onlyAvatar && (
        <span className={`text-sm truncate max-w-[80px] ${theme === 'dark' ? 'text-[#f0f0f0]' : 'text-[#1f1f1f]'}`}>
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
        key={`dropdown-${theme}`}
        style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          background: theme === 'dark' ? '#1e1f26' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#333333' : '#e8e8e8'}`,
          borderRadius: 4,
          boxShadow: theme === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: 120,
          display: menuVisible ? 'block' : 'none',
        }}
      >
        <Menu 
          mode='vertical' 
          items={menuItems} 
          style={{ 
            border: 'none', 
            boxShadow: 'none',
            background: 'transparent',
            color: theme === 'dark' ? '#f0f0f0' : '#1f1f1f',
          }} 
          className={`custom-user-menu ${theme === 'dark' ? 'dark-menu' : 'light-menu'}`}
        />
      </div>
      <Modal
        title={
          <span className='flex items-center gap-2'>
            <UserOutlined className='text-[#1677ff]' />
            <span>{t('profile_title')}</span>
          </span>
        }
        open={profileModalOpen}
        onCancel={() => setProfileModalOpen(false)}
        okText={t('save')}
        cancelText={t('cancel')}
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
                message.success(t('profile_updated'));
              } else {
                message.error(data.detail || t('update_failed'));
              }
            } catch {
              message.error(t('update_failed'));
            }
          });
        }}
      >
        <div className='flex gap-6 py-4'>
          <div className='flex flex-col items-center gap-3 min-w-[100px]'>
            <Avatar src={userInfo?.avatar_url} size={72} className='bg-gradient-to-tr from-[#31afff] to-[#1677ff]'>
              {userInfo?.real_name?.[0] || userInfo?.nick_name?.[0] || userInfo?.login_name?.[0] || '?'}
            </Avatar>
            <span className='text-xs text-gray-400'>{t('click_to_change_avatar')}</span>
          </div>
          <Divider type='vertical' className='h-full my-0' />
          <div className='flex-1'>
            <Form form={form} layout='vertical' size='middle'>
              <Form.Item label={t('login_account')}>
                <Input value={userInfo?.login_name || ''} disabled className='bg-gray-50' />
              </Form.Item>
              <Form.Item name='real_name' label={t('real_name')} rules={[{ required: true, message: t('please_input_real_name') }]}>
                <Input placeholder={t('please_input_real_name')} />
              </Form.Item>
              <Form.Item
                name='email'
                label={t('email')}
                rules={[
                  { type: 'email', message: t('invalid_email') },
                  { required: true, message: t('please_input_email') },
                ]}
              >
                <Input placeholder={t('please_input_email')} />
              </Form.Item>
              <Form.Item name='phone' label={t('phone')}>
                <Input placeholder={t('please_input_phone')} />
              </Form.Item>
            </Form>
          </div>
        </div>
      </Modal>
      <Modal
        title={
          <span className='flex items-center gap-2'>
            <LockOutlined className='text-[#1677ff]' />
            <span>{t('change_password')}</span>
          </span>
        }
        open={passwordModalOpen}
        onCancel={() => setPasswordModalOpen(false)}
        okText={t('confirm_modify')}
        cancelText={t('cancel')}
        onOk={() => {
          passwordForm.validateFields().then(async values => {
            if (values.new_password !== values.confirm_password) {
              message.error(t('password_mismatch'));
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
                message.success(t('password_updated'));
                passwordForm.resetFields();
              } else {
                message.error(data.detail || t('password_change_failed'));
              }
            } catch {
              message.error(t('password_change_failed'));
            }
          });
        }}
      >
        <div className='py-4'>
          <Form form={passwordForm} layout='vertical' size='middle'>
            <Form.Item name='old_password' label={t('old_password')} rules={[{ required: true, message: t('please_input_old_password') }]}>
              <Input.Password placeholder={t('please_input_old_password')} />
            </Form.Item>
            <Form.Item
              name='new_password'
              label={t('new_password')}
              rules={[
                { required: true, message: t('please_input_new_password') },
                { min: 6, message: t('password_min_length') },
              ]}
            >
              <Input.Password
                placeholder={t('please_input_new_password')}
                onChange={e => {
                  const strength = getPasswordStrength(e.target.value);
                  passwordForm.setFieldsValue({ passwordStrength: strength });
                }}
              />
            </Form.Item>
            {passwordForm.getFieldValue('new_password') && (
              <div className='mb-4 -mt-2'>
                <div className='flex items-center gap-2 mb-1'>
                  <span className='text-xs text-gray-500'>{t('password_strength')}：</span>
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
            <Form.Item name='confirm_password' label={t('confirm_new_password')} rules={[{ required: true, message: t('please_confirm_new_password') }]}>
              <Input.Password placeholder={t('please_confirm_new_password')} />
            </Form.Item>
          </Form>
          <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
            <div className='text-xs text-gray-500 mb-2'>{t('password_requirements')}</div>
            <ul className='text-xs text-gray-400 space-y-1'>
              <li>{t('password_req_length')}</li>
              <li>{t('password_req_suggest')}</li>
              <li>{t('password_req_unique')}</li>
            </ul>
          </div>
        </div>
      </Modal>
      <style>{`
        .custom-user-menu.dark-menu .ant-menu-item,
        .custom-user-menu.dark-menu .ant-menu-item-icon {
          color: #f0f0f0 !important;
        }
        .custom-user-menu.dark-menu .ant-menu-item:hover {
          background-color: #3d3e46 !important;
        }
        .custom-user-menu.light-menu .ant-menu-item,
        .custom-user-menu.light-menu .ant-menu-item-icon {
          color: #1f1f1f !important;
        }
        .custom-user-menu.light-menu .ant-menu-item:hover {
          background-color: #f0f0f0 !important;
        }
        .custom-user-menu .ant-menu-item-danger {
          color: #ff4d4f !important;
        }
      `}</style>
    </div>
  );
}
