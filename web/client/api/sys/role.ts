import { GET } from '@/client/api';

export interface RoleResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export async function getRoles(): Promise<RoleResponse[]> {
  const res = await GET('/api/v2/roles');
  if (res.data?.success) {
    return res.data.data || [];
  }
  return [];
}