/**
 * @jest-environment jsdom
 */

// Simple test suite for NewSideBar configuration

import { NAV_GROUPS, PERMISSION_KEYS, isPathActive, getRequiredPermissions, NavItem, NavGroup } from '../config';

describe('NewSideBar Configuration Tests', () => {
  describe('NAV_GROUPS structure', () => {
    it('should have exactly 5 navigation groups', () => {
      expect(NAV_GROUPS).toHaveLength(5);
    });

    it('should have correct group titles in order', () => {
      const expectedTitles = ['workspace', 'explore', 'config_center', 'developer_center', 'system_admin'];
      const actualTitles = NAV_GROUPS.map(g => g.title);
      expect(actualTitles).toEqual(expectedTitles);
    });

    it('should have valid item structure for all groups', () => {
      for (const group of NAV_GROUPS) {
        expect(group).toHaveProperty('title');
        expect(group).toHaveProperty('items');
        expect(Array.isArray(group.items)).toBe(true);

        for (const item of group.items) {
          expect(item).toHaveProperty('key');
          expect(item).toHaveProperty('label');
          expect(item).toHaveProperty('icon');
          expect(item).toHaveProperty('path');
        }
      }
    });
  });

  describe('Workspace group (group 1)', () => {
    it('should have 3 items', () => {
      const workspaceGroup = NAV_GROUPS[0];
      expect(workspaceGroup.items).toHaveLength(3);
    });

    it('should have chat, reports, favorites items', () => {
      const workspaceGroup = NAV_GROUPS[0];
      const keys = workspaceGroup.items.map(i => i.key);
      expect(keys).toContain('chat');
      expect(keys).toContain('reports');
      expect(keys).toContain('favorites');
    });

    it('items should not require permissions', () => {
      const workspaceGroup = NAV_GROUPS[0];
      for (const item of workspaceGroup.items) {
        expect(item.permission).toBeUndefined();
      }
    });
  });

  describe('Explore group (group 2)', () => {
    it('should have 2 items', () => {
      const exploreGroup = NAV_GROUPS[1];
      expect(exploreGroup.items).toHaveLength(2);
    });

    it('should have templates, team items', () => {
      const exploreGroup = NAV_GROUPS[1];
      const keys = exploreGroup.items.map(i => i.key);
      expect(keys).toContain('templates');
      expect(keys).toContain('team');
    });

    it('items should not require permissions', () => {
      const exploreGroup = NAV_GROUPS[1];
      for (const item of exploreGroup.items) {
        expect(item.permission).toBeUndefined();
      }
    });
  });

  describe('Config Center group (group 3)', () => {
    it('should have 2 items', () => {
      const configGroup = NAV_GROUPS[2];
      expect(configGroup.items).toHaveLength(2);
    });

    it('should have datasources, knowledge items', () => {
      const configGroup = NAV_GROUPS[2];
      const keys = configGroup.items.map(i => i.key);
      expect(keys).toContain('datasources');
      expect(keys).toContain('knowledge');
    });

    it('items should require permissions', () => {
      const configGroup = NAV_GROUPS[2];
      for (const item of configGroup.items) {
        expect(item.permission).toBeDefined();
      }
    });
  });

  describe('Developer Center group (group 4)', () => {
    it('should have 6 items', () => {
      const devGroup = NAV_GROUPS[3];
      expect(devGroup.items).toHaveLength(6);
    });

    it('should have skills, prompts, awel_workflow, app_management, models_evaluation, dbgpts', () => {
      const devGroup = NAV_GROUPS[3];
      const keys = devGroup.items.map(i => i.key);
      expect(keys).toContain('skills');
      expect(keys).toContain('prompts');
      expect(keys).toContain('awel_workflow');
      expect(keys).toContain('app_management');
      expect(keys).toContain('models_evaluation');
      expect(keys).toContain('dbgpts');
    });

    it('all items should require permissions', () => {
      const devGroup = NAV_GROUPS[3];
      for (const item of devGroup.items) {
        expect(item.permission).toBeDefined();
      }
    });
  });

  describe('System Admin group (group 5)', () => {
    it('should have 5 items', () => {
      const adminGroup = NAV_GROUPS[4];
      expect(adminGroup.items).toHaveLength(5);
    });

    it('should have registration, user, role, dept, permission items', () => {
      const adminGroup = NAV_GROUPS[4];
      const keys = adminGroup.items.map(i => i.key);
      expect(keys).toContain('registration');
      expect(keys).toContain('user');
      expect(keys).toContain('role');
      expect(keys).toContain('dept');
      expect(keys).toContain('permission');
    });

    it('all items should require permissions', () => {
      const adminGroup = NAV_GROUPS[4];
      for (const item of adminGroup.items) {
        expect(item.permission).toBeDefined();
      }
    });
  });

  describe('PERMISSION_KEYS', () => {
    it('should have all required permission keys', () => {
      expect(PERMISSION_KEYS.DATASOURCES).toBe('datasources');
      expect(PERMISSION_KEYS.KNOWLEDGE).toBe('knowledge');
      expect(PERMISSION_KEYS.SKILLS).toBe('settings.skills');
      expect(PERMISSION_KEYS.PROMPTS).toBe('settings.prompts');
      expect(PERMISSION_KEYS.AWEL_WORKFLOW).toBe('settings.awel_workflow');
      expect(PERMISSION_KEYS.APP_MANAGEMENT).toBe('settings.app_management');
      expect(PERMISSION_KEYS.MODELS_EVALUATION).toBe('settings.models_evaluation');
      expect(PERMISSION_KEYS.DBGPTS_COMMUNITY).toBe('settings.dbgpts_community');
      expect(PERMISSION_KEYS.REGISTRATION_REVIEW).toBe('management.registration_review');
      expect(PERMISSION_KEYS.USER_MANAGEMENT).toBe('management.user_management');
      expect(PERMISSION_KEYS.ROLE_MANAGEMENT).toBe('management.role_management');
      expect(PERMISSION_KEYS.DEPT_MANAGEMENT).toBe('management.dept_management');
      expect(PERMISSION_KEYS.PERMISSION_MANAGEMENT).toBe('management.permission_management');
    });
  });

  describe('isPathActive helper function', () => {
    it('should return true when pathname matches root path "/"', () => {
      expect(isPathActive('/', '/')).toBe(true);
    });

    it('should return false for root path when pathname is different', () => {
      expect(isPathActive('/admin/user', '/')).toBe(false);
      expect(isPathActive('/construct/database', '/')).toBe(false);
    });

    it('should return true when pathname starts with item path', () => {
      expect(isPathActive('/admin/user', '/admin')).toBe(true);
      expect(isPathActive('/admin/registration', '/admin')).toBe(true);
      expect(isPathActive('/admin/user/detail', '/admin')).toBe(true);
      expect(isPathActive('/construct/database', '/construct')).toBe(true);
      expect(isPathActive('/construct/knowledge', '/construct')).toBe(true);
    });

    it('should return false when pathname does not start with item path', () => {
      expect(isPathActive('/admin/user', '/construct')).toBe(false);
      expect(isPathActive('/construct/database', '/admin')).toBe(false);
    });

    it('should handle exact match for non-root paths', () => {
      expect(isPathActive('/reports', '/reports')).toBe(true);
    });
  });

  describe('getRequiredPermissions helper function', () => {
    it('should return an array', () => {
      expect(Array.isArray(getRequiredPermissions())).toBe(true);
    });

    it('should return all unique permission keys', () => {
      const permissions = getRequiredPermissions();
      expect(permissions).toContain('datasources');
      expect(permissions).toContain('knowledge');
      expect(permissions).toContain('settings.skills');
      expect(permissions).toContain('management.registration_review');
    });

    it('should not contain duplicates', () => {
      const permissions = getRequiredPermissions();
      const uniqueSet = new Set(permissions);
      expect(permissions.length).toBe(uniqueSet.size);
    });

    it('should include management permissions', () => {
      const permissions = getRequiredPermissions();
      expect(permissions).toContain('management.user_management');
      expect(permissions).toContain('management.role_management');
      expect(permissions).toContain('management.dept_management');
      expect(permissions).toContain('management.permission_management');
    });
  });

  describe('Icon mapping validation', () => {
    const validIcons = [
      'MessageOutlined',
      'FileTextOutlined',
      'StarOutlined',
      'AppstoreOutlined',
      'TeamOutlined',
      'DatabaseOutlined',
      'BookOutlined',
      'ToolOutlined',
      'EditOutlined',
      'ApartmentOutlined',
      'LineChartOutlined',
      'GlobalOutlined',
      'UserAddOutlined',
      'UserOutlined',
      'KeyOutlined',
      'SafetyOutlined',
    ];

    it('should use only valid Ant Design icon names', () => {
      for (const group of NAV_GROUPS) {
        for (const item of group.items) {
          expect(validIcons).toContain(item.icon);
        }
      }
    });
  });

  describe('Path validation', () => {
    it('should have valid paths for all items', () => {
      for (const group of NAV_GROUPS) {
        for (const item of group.items) {
          expect(item.path).toBeDefined();
          expect(typeof item.path).toBe('string');
          expect(item.path.length).toBeGreaterThan(0);
          expect(item.path.startsWith('/')).toBe(true);
        }
      }
    });

    it('should have correct paths for specific items', () => {
      // Find chat item in workspace
      const workspaceGroup = NAV_GROUPS[0];
      const chatItem = workspaceGroup.items.find(i => i.key === 'chat');
      expect(chatItem?.path).toBe('/');

      // Find registration item in system admin
      const adminGroup = NAV_GROUPS[4];
      const registrationItem = adminGroup.items.find(i => i.key === 'registration');
      expect(registrationItem?.path).toBe('/admin/registration');
    });
  });

  describe('Badge configuration', () => {
    it('should only have badge on registration item', () => {
      let foundRegistrationWithBadge = false;
      for (const group of NAV_GROUPS) {
        for (const item of group.items) {
          if (item.key === 'registration') {
            expect(item.badge).toBeDefined();
            foundRegistrationWithBadge = true;
          } else {
            // Other items should not have badge property set
            expect(item.badge).toBeUndefined();
          }
        }
      }
      expect(foundRegistrationWithBadge).toBe(true);
    });
  });
});