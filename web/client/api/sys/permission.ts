import { GET } from '@/client/api';

export interface PermissionTreeNode {
  id: number;
  code: string;
  name: string;
  parent_code: string | null;
  perm_type: string;
  sort: number;
  children: PermissionTreeNode[];
}

export async function getPermissions(): Promise<PermissionTreeNode[]> {
  const res = await GET('/api/v2/sys/permissions');
  if (res.data?.success) {
    return res.data.data || [];
  }
  return [];
}