'use client';

import { PermissionTreeNode, getPermissions } from '@/client/api/sys/permission';
import { SafetyOutlined } from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import { Card, Spin, Tree } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageHeader from '@/new-components/common/PageHeader';
import '@/styles/chatbi-variables.css';

export default function PermissionManagementPage() {
  const { t } = useTranslation();
  const [permissionTree, setPermissionTree] = useState<PermissionTreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPermissions();
      setPermissionTree(data);
    } catch (e) {
      console.error(t('Load_Permission_Failed'), e);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const convertToTreeData = (permissions: PermissionTreeNode[]): TreeDataNode[] => {
    return permissions.map(perm => ({
      key: perm.id,
      title: (
        <div className='flex items-center gap-2'>
          <SafetyOutlined className='text-[var(--primary)]' />
          <span>{perm.name}</span>
          <span className='text-xs text-[var(--text-tertiary)] ml-2'>{perm.code}</span>
        </div>
      ),
      children: perm.children && perm.children.length > 0 ? convertToTreeData(perm.children) : undefined,
    }));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size='large' />
      </div>
    );
  }

  return (
    <div className='bg-[var(--bg-primary)] min-h-screen p-6'>
      <PageHeader title={t('permission_management')} description={t('permission_management')} />

      <div className='bg-[var(--card-bg)] rounded-[12px] p-4 shadow-sm'>
        <Card
          title={t('Permission_List')}
          extra={
            <span className='text-[var(--text-tertiary)] text-sm'>
              {t('Permission_Total_Count', { count: permissionTree.length })}
            </span>
          }
        >
          {permissionTree.length > 0 ? (
            <Tree
              showLine={{ showLeafIcon: false }}
              treeData={convertToTreeData(permissionTree)}
              defaultExpandAll
              blockNode
            />
          ) : (
            <div className='text-center text-[var(--text-tertiary)] py-8'>{t('No_Permission_Data')}</div>
          )}
        </Card>
      </div>
    </div>
  );
}
