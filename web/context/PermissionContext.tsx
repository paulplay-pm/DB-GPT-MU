import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    // 从登录响应或 cookie 获取权限列表
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      const user = JSON.parse(userInfo);
      setPermissions(user.permissions || []);
    }
  }, []);

  const hasPermission = (code: string) => {
    // 超级管理员拥有所有权限
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    if (userInfo.is_super_admin) return true;
    return permissions.includes(code);
  };

  return (
    <PermissionContext.Provider value={{ permissions, hasPermission, setPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
}