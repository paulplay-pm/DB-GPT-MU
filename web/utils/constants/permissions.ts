// 权限码常量 - 集中管理所有权限码
export const PERMISSIONS = {
  USER: {
    VIEW: 'user.view',
    EDIT: 'user.edit',
    MANAGEMENT: 'user.management',
  },
  DEPT: {
    VIEW: 'dept.view',
    EDIT: 'dept.edit',
    MANAGEMENT: 'dept.management',
  },
  ROLE: {
    VIEW: 'role.view',
    EDIT: 'role.edit',
    MANAGEMENT: 'role.management',
  },
  REGISTRATION: {
    VIEW: 'registration.view',
    APPROVE: 'registration.approve',
    REJECT: 'registration.reject',
  },
} as const;

// 所有权限码列表 (用于权限初始化等场景)
export const ALL_PERMISSION_CODES = Object.values(PERMISSIONS).flatMap(category =>
  Object.values(category)
);

// 权限码类型
export type PermissionCode = typeof ALL_PERMISSION_CODES[number];