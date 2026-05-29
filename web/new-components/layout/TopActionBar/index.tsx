import { QuestionCircleOutlined, BellOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal, Tooltip } from 'antd';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';

// Page name mapping: path -> i18n key
const PAGE_NAME_MAP: { [key: string]: string } = {
  '/': 'chat',
  '/reports': 'reports',
  '/favorites': 'favorites',
  '/templates': 'templates',
  '/team': 'team',
  '/construct/database': 'datasources',
  '/construct/knowledge': 'knowledge',
  '/construct/skills': 'skills',
  '/construct/prompt': 'prompts',
  '/construct/flow': 'awel_workflow',
  '/construct/app': 'app_management',
  '/construct/models': 'model_management',
  '/models_evaluation': 'models_evaluation',
  '/construct/dbgpts': 'dbgpts_community',
  '/admin/registration': 'registration_review',
  '/admin/user': 'user_management',
  '/admin/role': 'role_management',
  '/admin/dept': 'dept_management',
  '/admin/permission': 'permission_management',
};

// Parent path mapping: parent key -> path
const PAGE_PATH_MAP: { [key: string]: string } = {
  chat: '/',
  reports: '/reports',
  favorites: '/favorites',
  templates: '/templates',
  team: '/team',
  datasources: '/construct/database',
  knowledge: '/construct/knowledge',
  skills: '/construct/skills',
  prompts: '/construct/prompt',
  awel_workflow: '/construct/flow',
  app_management: '/construct/app',
  model_management: '/construct/models',
  models_evaluation: '/models_evaluation',
  dbgpts_community: '/construct/dbgpts',
  registration_review: '/admin/registration',
  user_management: '/admin/user',
  role_management: '/admin/role',
  dept_management: '/admin/dept',
  permission_management: '/admin/permission',
};

function TopActionBar() {
  const { t } = useTranslation();
  const router = useRouter();

  const breadcrumbs = useMemo(() => {
    const { pathname, query } = router;
    const parentKey = PAGE_NAME_MAP[pathname];

    // If no parent mapping, try to find by checking if pathname starts with a key
    let resolvedParentKey = parentKey;
    if (!resolvedParentKey) {
      // Check for partial matches like /construct/flow vs /construct/flow/canvas
      const keys = Object.keys(PAGE_NAME_MAP);
      resolvedParentKey = keys.find(
        k => k !== '/' && pathname.startsWith(k)
      ) || 'chat';
    }

    const parent = resolvedParentKey || 'chat';
    const parentPath = PAGE_PATH_MAP[parent] || '/';

    // Get child from query if present (title takes precedence over id)
    const child = typeof query.title === 'string'
      ? decodeURIComponent(query.title)
      : (typeof query.id === 'string' ? query.id : undefined);

    return { parent, parentPath, child };
  }, [router.pathname, router.query]);

  const handleHelp = () => {
    window.open('http://docs.dbgpt.cn', '_blank');
  };

  const handleNotification = () => {
    Modal.info({
      title: t('no_notification') || '暂无通知',
      content: null,
      okText: t('close') || '关闭',
    });
  };

  const handleNewChat = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
      router.push('/').then(() => {
        window.dispatchEvent(new Event('popstate'));
      });
    }
  };

  const handleParentClick = () => {
    router.push(breadcrumbs.parentPath);
  };

  return (
    <div className='h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)] border-b-[1px] bg-[var(--bg-secondary)] box-border overflow-hidden shrink-0'>
      {/* Left: Breadcrumb */}
      <div className='flex items-center gap-2'>
        {breadcrumbs.child ? (
          <>
            <span
              className='text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition-colors'
              onClick={handleParentClick}
            >
              {t(breadcrumbs.parent)}
            </span>
            <span className='text-[var(--text-tertiary)]'>/</span>
            <span className='text-[var(--text-primary)] font-medium'>
              {breadcrumbs.child.length > 20
                ? breadcrumbs.child.substring(0, 20) + '...'
                : breadcrumbs.child}
            </span>
          </>
        ) : (
          <span className='text-[var(--text-primary)] font-medium'>
            {t(breadcrumbs.parent)}
          </span>
        )}
      </div>

      {/* Right: Action buttons */}
      <div className='flex items-center gap-4'>
        <Tooltip title={t('help') || '帮助'}>
          <QuestionCircleOutlined
            className='text-lg cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
            onClick={handleHelp}
          />
        </Tooltip>

        <Tooltip title={t('notification') || '通知'}>
          <BellOutlined
            className='text-lg cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors'
            onClick={handleNotification}
          />
        </Tooltip>

        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={handleNewChat}
          size='middle'
        >
          {t('new_chat') || '新建对话'}
        </Button>
      </div>
    </div>
  );
}

export default TopActionBar;