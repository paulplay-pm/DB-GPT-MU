import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { STORAGE_USERINFO_KEY } from '@/utils/constants/index';
import { getUserPermissions } from '@/client/api/sys/user';

interface PermissionContextType {
  permissions: string[];
  hasPermission: (code: string) => boolean;
  setPermissions: (perms: string[]) => void;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  hasPermission: () => false,
  setPermissions: () => {},
  refreshPermissions: async () => {},
});

export const usePermission = () => useContext(PermissionContext);

async function fetchPermissionsFromApi(userId: number, user: Record<string, any>): Promise<string[]> {
  try {
    const perms = await getUserPermissions(userId);
    // Update localStorage so other tabs get the update
    const updatedUser = { ...user, permissions: perms };
    localStorage.setItem(STORAGE_USERINFO_KEY, JSON.stringify(updatedUser));
    return perms;
  } catch {
    return [];
  }
}

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);

  const refreshPermissions = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const userInfo = localStorage.getItem(STORAGE_USERINFO_KEY);
    if (!userInfo) {
      setPermissions([]);
      return;
    }
    try {
      const user = JSON.parse(userInfo);
      if (user.is_super_admin) {
        setPermissions(['*']);
        return;
      }
      if (user.id) {
        const perms = await fetchPermissionsFromApi(user.id, user);
        setPermissions(perms);
      }
    } catch {
      setPermissions([]);
    }
  }, []);

  // Initial load and storage event listener
  useEffect(() => {
    let isMounted = true;

    const loadPermissions = async () => {
      const userInfo = localStorage.getItem(STORAGE_USERINFO_KEY);
      if (!userInfo) {
        if (isMounted) setPermissions([]);
        return;
      }
      try {
        const user = JSON.parse(userInfo);
        // Use cached permissions from localStorage if available and not empty
        if (user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0) {
          if (isMounted) setPermissions(user.permissions);
        } else if (user.id) {
          // Fetch fresh permissions from API if no cached permissions
          const perms = await fetchPermissionsFromApi(user.id, user);
          if (isMounted) setPermissions(perms);
        } else if (user.is_super_admin) {
          if (isMounted) setPermissions(['*']);
        }
      } catch {
        if (isMounted) setPermissions([]);
      }
    };

    loadPermissions();

    // Listen for cross-tab storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_USERINFO_KEY) {
        if (e.newValue) {
          try {
            const user = JSON.parse(e.newValue);
            if (isMounted) setPermissions(user.permissions || []);
          } catch {
            if (isMounted) setPermissions([]);
          }
        } else {
          if (isMounted) setPermissions([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const hasPermission = (code: string) => {
    if (typeof window === 'undefined') return false;
    const userInfo = JSON.parse(localStorage.getItem(STORAGE_USERINFO_KEY) || '{}');
    if (userInfo.is_super_admin) return true;
    if (permissions.includes('*')) return true;
    return permissions.includes(code);
  };

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, setPermissions, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}