import { GET, POST } from '@/client/api';

export interface RegistrationResponse {
  id: number;
  login_name: string;
  real_name?: string;
  email?: string;
  dept_id?: number;
  status: string;
  reject_reason?: string;
  created_at: string;
}

export interface RegisterRequest {
  login_name: string;
  password: string;
  real_name?: string;
  email?: string;
  dept_id?: number;
}

export interface ApproveRequest {
  dept_id?: number;
  role_ids?: number[];
}

export interface RejectRequest {
  reason: string;
}

export async function getRegistrations(status?: string): Promise<RegistrationResponse[]> {
  const url = status ? `/api/v2/sys/registrations?status=${status}` : '/api/v2/sys/registrations';
  const res = await GET(url);
  if (res.data?.success) {
    return res.data.data || [];
  }
  return [];
}

export async function approveRegistration(id: number, data: ApproveRequest): Promise<void> {
  const res = await POST<ApproveRequest, { user_id: number }>(`/api/v2/sys/registrations/${id}/approve`, data);
  if (!res.data?.success) {
    throw new Error(res.data?.err_msg || '审核通过失败');
  }
}

export async function rejectRegistration(id: number, data: RejectRequest): Promise<void> {
  const res = await POST<RejectRequest, null>(`/api/v2/sys/registrations/${id}/reject`, data);
  if (!res.data?.success) {
    throw new Error(res.data?.err_msg || '审核拒绝失败');
  }
}
