import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_USERINFO_KEY } from '@/utils/constants/index';

interface PermissionContextType {
  permissions: string[];
  hasPermission: (code: string) => boolean;
  setPermissions: (perms: string[]) => void;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  hasPermission: () => false,
  setPermissions: () => {},
});

export const usePermission = () => useContext(PermissionContext);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>(() => {
    // 同步读取 localStorage 初始化 state
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem(STORAGE_USERINFO_KEY);
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          return user.permissions || [];
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = () => {
      const userInfo = localStorage.getItem(STORAGE_USERINFO_KEY);
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          setPermissions(user.permissions || []);
        } catch {
          setPermissions([]);
        }
      } else {
        setPermissions([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const hasPermission = (code: string) => {
    const userInfo = JSON.parse(localStorage.getItem(STORAGE_USERINFO_KEY) || '{}');
    if (userInfo.is_super_admin) return true;
    return permissions.includes(code);
  };

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, setPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}