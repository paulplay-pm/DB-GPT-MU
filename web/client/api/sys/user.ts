import { GET, POST, PUT } from '@/client/api';

export interface UserResponse {
  id: number;
  user_id: string;
  login_name: string;
  real_name?: string;
  email?: string;
  phone?: string;
  dept_id?: number;
  is_active: boolean;
  is_super_admin: boolean;
}

export interface UserCreateRequest {
  user_id: string;
  login_name: string;
  password: string;
  real_name?: string;
  email?: string;
  phone?: string;
  dept_id?: number;
}

export interface UserUpdateRequest {
  real_name?: string;
  email?: string;
  phone?: string;
  dept_id?: number;
  is_active?: boolean;
}

export async function getUsers(): Promise<UserResponse[]> {
  const res = await GET('/api/v2/sys/users');
  if (res.data?.success) {
    return res.data.data || [];
  }
  return [];
}

export async function getUser(id: number): Promise<UserResponse | null> {
  const res = await GET(`/api/v2/sys/users/${id}`);
  if (res.data?.success) {
    return res.data.data;
  }
  return null;
}

export async function createUser(data: UserCreateRequest): Promise<number> {
  const res = await POST<UserCreateRequest, { id: number }>('/api/v2/sys/users', data);
  if (res.data?.success) {
    return res.data.data?.id || 0;
  }
  throw new Error(res.data?.err_msg || '创建用户失败');
}

export async function updateUser(id: number, data: UserUpdateRequest): Promise<void> {
  const res = await PUT<UserUpdateRequest, null>(`/api/v2/sys/users/${id}`, data);
  if (!res.data?.success) {
    throw new Error(res.data?.err_msg || '更新用户失败');
  }
}

export async function updateUserRoles(id: number, roleIds: number[]): Promise<void> {
  const res = await PUT<number[], null>(`/api/v2/sys/users/${id}/roles`, roleIds);
  if (!res.data?.success) {
    throw new Error(res.data?.err_msg || '更新用户角色失败');
  }
}

export async function getUserPermissions(id: number): Promise<string[]> {
  const res = await GET(`/api/v2/sys/users/${id}/permissions`);
  if (res.data?.success) {
    return res.data.data || [];
  }
  return [];
}

export async function getUserRoles(id: number): Promise<number[]> {
  const res = await GET(`/api/v2/sys/users/${id}/roles`);
  if (res.data?.success) {
    return res.data.data || [];
  }
  return [];
}
