// Navigation configuration for NewSideBar
// 5-group navigation structure

export interface NavItem {
  key: string;
  label: string;
  icon: string; // Ant Design icon name
  path: string;
  permission?: string; // If undefined, no permission required
  badge?: number; // For badge display (e.g., pending count)
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

// Permission keys from existing codebase
export const PERMISSION_KEYS = {
  // Data permissions
  DATASOURCES: 'datasources',
  KNOWLEDGE: 'knowledge',

  // Settings permissions
  APP_MANAGEMENT: 'settings.app_management',
  MODEL_MANAGE: 'settings.model_manage',
  AWEL_WORKFLOW: 'settings.awel_workflow',
  PROMPTS: 'settings.prompts',
  DBGPTS_COMMUNITY: 'settings.dbgpts_community',
  MODELS_EVALUATION: 'settings.models_evaluation',
  SKILLS: 'settings.skills',

  // Management permissions
  USER_MANAGEMENT: 'management.user_management',
  ROLE_MANAGEMENT: 'management.role_management',
  DEPT_MANAGEMENT: 'management.dept_management',
  PERMISSION_MANAGEMENT: 'management.permission_management',
  REGISTRATION_REVIEW: 'management.registration_review',
} as const;

// Navigation groups - 5 groups
export const NAV_GROUPS: NavGroup[] = [
  // Group 1: 工作区 (Workspace)
  {
    title: 'workspace',
    items: [
      {
        key: 'chat',
        label: 'chat',
        icon: 'MessageOutlined',
        path: '/',
      },
      {
        key: 'reports',
        label: 'reports',
        icon: 'FileTextOutlined',
        path: '/reports',
      },
      {
        key: 'favorites',
        label: 'favorites',
        icon: 'StarOutlined',
        path: '/favorites',
      },
    ],
  },
  // Group 2: 探索发现 (Explore)
  {
    title: 'explore',
    items: [
      {
        key: 'templates',
        label: 'templates',
        icon: 'AppstoreOutlined',
        path: '/templates',
      },
      {
        key: 'team',
        label: 'team',
        icon: 'TeamOutlined',
        path: '/team',
      },
    ],
  },
  // Group 3: 配置中心 (Configuration)
  {
    title: 'config_center',
    items: [
      {
        key: 'datasources',
        label: 'datasources',
        icon: 'DatabaseOutlined',
        path: '/construct/database',
        permission: PERMISSION_KEYS.DATASOURCES,
      },
      {
        key: 'knowledge',
        label: 'knowledge',
        icon: 'BookOutlined',
        path: '/construct/knowledge',
        permission: PERMISSION_KEYS.KNOWLEDGE,
      },
    ],
  },
  // Group 4: 开发者中心 (Developer Center)
  {
    title: 'developer_center',
    items: [
      {
        key: 'skills',
        label: 'skills',
        icon: 'ToolOutlined',
        path: '/construct/skills',
        permission: 'skills.view',
      },
      {
        key: 'model_management',
        label: 'model_manage',
        icon: 'DatabaseOutlined',
        path: '/construct/models',
        permission: PERMISSION_KEYS.MODEL_MANAGE,
      },
      {
        key: 'prompts',
        label: 'prompts',
        icon: 'EditOutlined',
        path: '/construct/prompt',
        permission: PERMISSION_KEYS.PROMPTS,
      },
      {
        key: 'awel_workflow',
        label: 'awel_workflow',
        icon: 'ApartmentOutlined',
        path: '/construct/flow',
        permission: PERMISSION_KEYS.AWEL_WORKFLOW,
      },
      {
        key: 'app_management',
        label: 'app_management',
        icon: 'AppstoreOutlined',
        path: '/construct/app',
        permission: PERMISSION_KEYS.APP_MANAGEMENT,
      },
      {
        key: 'models_evaluation',
        label: 'models_evaluation',
        icon: 'LineChartOutlined',
        path: '/models_evaluation',
        permission: PERMISSION_KEYS.MODELS_EVALUATION,
      },
      {
        key: 'dbgpts',
        label: 'dbgpts_community',
        icon: 'GlobalOutlined',
        path: '/construct/dbgpts',
        permission: PERMISSION_KEYS.DBGPTS_COMMUNITY,
      },
    ],
  },
  // Group 5: 系统管理 (System Management)
  {
    title: 'system_admin',
    items: [
      {
        key: 'registration',
        label: 'registration_review',
        icon: 'UserAddOutlined',
        path: '/admin/registration',
        permission: PERMISSION_KEYS.REGISTRATION_REVIEW,
        badge: 0, // Will be updated dynamically
      },
      {
        key: 'user',
        label: 'user_management',
        icon: 'UserOutlined',
        path: '/admin/user',
        permission: PERMISSION_KEYS.USER_MANAGEMENT,
      },
      {
        key: 'role',
        label: 'role_management',
        icon: 'KeyOutlined',
        path: '/admin/role',
        permission: PERMISSION_KEYS.ROLE_MANAGEMENT,
      },
      {
        key: 'dept',
        label: 'dept_management',
        icon: 'ApartmentOutlined',
        path: '/admin/dept',
        permission: PERMISSION_KEYS.DEPT_MANAGEMENT,
      },
      {
        key: 'permission',
        label: 'permission_management',
        icon: 'SafetyOutlined',
        path: '/admin/permission',
        permission: PERMISSION_KEYS.PERMISSION_MANAGEMENT,
      },
    ],
  },
];

// Helper function to check if a path matches the current pathname
export function isPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return pathname === '/';
  }
  return pathname.startsWith(itemPath);
}

// Get all permission keys that need to be checked
export function getRequiredPermissions(): string[] {
  const permissions: string[] = [];
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.permission && !permissions.includes(item.permission)) {
        permissions.push(item.permission);
      }
    }
  }
  return permissions;
}
