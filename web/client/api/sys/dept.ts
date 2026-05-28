import { DELETE, GET, POST, PUT } from '@/client/api';

export interface DeptTreeNode {
  id: number;
  code: string;
  name: string;
  parent_id?: number;
  level: number;
  sort: number;
  children: DeptTreeNode[];
}

export interface DeptCreateRequest {
  code: string;
  name: string;
  parent_id?: number;
  level?: number;
  sort?: number;
}

export interface DeptUpdateRequest {
  code?: string;
  name?: string;
  parent_id?: number;
  level?: number;
  sort?: number;
}

/**
 * 获取部门树
 */
export async function getDeptTree(): Promise<DeptTreeNode[]> {
  const res = await GET('/api/v2/sys/depts');
  if (res.data?.success) {
    return res.data.data || [];
  }
  return [];
}

/**
 * 获取部门详情
 */
export async function getDept(id: number): Promise<DeptTreeNode | null> {
  const res = await GET(`/api/v2/sys/depts/${id}`);
  if (res.data?.success) {
    return res.data.data;
  }
  return null;
}

/**
 * 创建部门
 */
export async function createDept(data: DeptCreateRequest): Promise<number> {
  const res = await POST<DeptCreateRequest, { id: number }>('/api/v2/sys/depts', data);
  if (res.data?.success) {
    return res.data.data?.id || 0;
  }
  throw new Error(res.data?.err_msg || '创建部门失败');
}

/**
 * 更新部门
 */
export async function updateDept(id: number, data: DeptUpdateRequest): Promise<void> {
  const res = await PUT<DeptUpdateRequest, null>(`/api/v2/sys/depts/${id}`, data);
  if (!res.data?.success) {
    throw new Error(res.data?.err_msg || '更新部门失败');
  }
}

/**
 * 删除部门
 */
export async function deleteDept(id: number): Promise<void> {
  const res = await DELETE(`/api/v2/sys/depts/${id}`);
  if (!res.data?.success) {
    throw new Error(res.data?.err_msg || '删除部门失败');
  }
}
