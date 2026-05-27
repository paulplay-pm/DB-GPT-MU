import { GET, POST, PUT, DELETE } from '@/client/api';

export interface RoleResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface RoleCreateRequest {
  code: string;
  name: string;
  description?: string;
}

export interface RoleUpdateRequest {
  code?: string;
  name?: string;
  description?: string;
}

export async function getRoles(): Promise<RoleResponse[]> {
  const res = await GET('/api/v2/sys/roles');
  if (res.data?.success) {
    return res.data.data || [];
  }
  return [];
}

export async function getRole(roleId: number): Promise<RoleResponse | null> {
  const res = await GET(`/api/v2/sys/roles/${roleId}`);
  if (res.data?.success) {
    return res.data.data;
  }
  return null;
}

export async function createRole(data: RoleCreateRequest): Promise<number> {
  const res = await POST('/api/v2/sys/roles', data);
  if (res.data?.success) {
    return res.data.data.id;
  }
  throw new Error(res.data?.err_msg || '创建角色失败');
}

export async function updateRole(roleId: number, data: RoleUpdateRequest): Promise<void> {
  const res = await PUT(`/api/v2/sys/roles/${roleId}`, data);
  if (!res.data?.success) {
    throw new Error(res.data?.err_msg || '更新角色失败');
  }
}

export async function deleteRole(roleId: number): Promise<void> {
  const res = await DELETE(`/api/v2/sys/roles/${roleId}`);
  if (!res.data?.success) {
    throw new Error(res.data?.err_msg || '删除角色失败');
  }
}

export async function getRolePermissions(roleId: number): Promise<number[]> {
  const res = await GET(`/api/v2/sys/roles/${roleId}/permissions`);
  if (res.data?.success) {
    return res.data.data || [];
  }
  return [];
}

export async function updateRolePermissions(roleId: number, permissionIds: number[]): Promise<void> {
  const res = await PUT(`/api/v2/sys/roles/${roleId}/permissions`, permissionIds);
  if (!res.data?.success) {
    throw new Error(res.data?.err_msg || '更新角色权限失败');
  }
}