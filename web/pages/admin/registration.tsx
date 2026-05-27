'use client';

import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, Form, Input, Modal, Select, Space, Table, Tag, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DeptTreeNode, getDeptTree } from '@/client/api/sys/dept';
import {
  ApproveRequest,
  RegistrationResponse,
  RejectRequest,
  approveRegistration,
  getRegistrations,
  rejectRegistration,
} from '@/client/api/sys/registration';
import { RoleResponse, getRoles } from '@/client/api/sys/role';

export default function RegistrationManagementPage() {
  const { t } = useTranslation();
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([]);
  const [depts, setDepts] = useState<DeptTreeNode[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Approve modal
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [approveForm] = Form.useForm();
  const [currentRegId, setCurrentRegId] = useState<number | null>(null);

  // Reject modal
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectForm] = Form.useForm();
  const [rejectRegId, setRejectRegId] = useState<number | null>(null);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRegistrations(statusFilter);
      setRegistrations(data);
    } catch (e: any) {
      message.error(e.message || t('Load_Registration_Failed'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, t]);

  const loadDepts = useCallback(async () => {
    try {
      const data = await getDeptTree();
      setDepts(data);
    } catch (e: any) {
      message.error(e.message || t('Load_Dept_Failed'));
    }
  }, [t]);

  const loadRoles = useCallback(async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (e: any) {
      message.error(e.message || t('Load_Role_Failed'));
    }
  }, [t]);

  useEffect(() => {
    loadRegistrations();
    loadDepts();
    loadRoles();
  }, [loadRegistrations, loadDepts, loadRoles]);

  const handleApprove = (record: RegistrationResponse) => {
    setCurrentRegId(record.id);
    approveForm.setFieldsValue({ dept_id: record.dept_id });
    setApproveModalVisible(true);
  };

  const handleReject = (record: RegistrationResponse) => {
    setRejectRegId(record.id);
    setRejectModalVisible(true);
  };

  const handleApproveSubmit = async () => {
    try {
      const values = await approveForm.validateFields();
      if (currentRegId === null) return;

      const data: ApproveRequest = {
        dept_id: values.dept_id,
        role_ids: values.role_ids,
      };
      await approveRegistration(currentRegId, data);
      message.success(t('Approve_Success'));
      setApproveModalVisible(false);
      approveForm.resetFields();
      loadRegistrations();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      message.error(e.message || t('Operation_Failed'));
    }
  };

  const handleRejectSubmit = async () => {
    try {
      const values = await rejectForm.validateFields();
      if (rejectRegId === null) return;

      const data: RejectRequest = {
        reason: values.reason,
      };
      await rejectRegistration(rejectRegId, data);
      message.success(t('Reject_Success'));
      setRejectModalVisible(false);
      rejectForm.resetFields();
      loadRegistrations();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      message.error(e.message || t('Operation_Failed'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'gold';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('Pending');
      case 'approved':
        return t('Approved');
      case 'rejected':
        return t('Rejected');
      default:
        return status;
    }
  };

  const columns: TableProps<RegistrationResponse>['columns'] = [
    {
      title: t('Admin_Login_Name'),
      dataIndex: 'login_name',
      key: 'login_name',
      width: 150,
    },
    {
      title: t('Admin_Real_Name'),
      dataIndex: 'real_name',
      key: 'real_name',
      width: 120,
    },
    {
      title: t('Admin_Email'),
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: t('Admin_Status'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: t('Registration_Reject_Reason'),
      dataIndex: 'reject_reason',
      key: 'reject_reason',
      width: 200,
    },
    {
      title: t('Registration_Apply_Time'),
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: t('Admin_Operation'),
      key: 'action',
      width: 150,
      render: (_: any, record: RegistrationResponse) => {
        if (record.status !== 'pending') {
          return <span style={{ color: '#999' }}>{t('Registration_Processed')}</span>;
        }
        return (
          <Space size='small'>
            <Button type='text' size='small' icon={<CheckOutlined />} onClick={() => handleApprove(record)}>
              {t('Approve')}
            </Button>
            <Button type='text' size='small' danger icon={<CloseOutlined />} onClick={() => handleReject(record)}>
              {t('Reject')}
            </Button>
          </Space>
        );
      },
    },
  ];

  const flattenDepts = (deptList: DeptTreeNode[]): DeptTreeNode[] => {
    const result: DeptTreeNode[] = [];
    const flatten = (list: DeptTreeNode[], level: number) => {
      for (const dept of list) {
        result.push({ ...dept, level });
        if (dept.children && dept.children.length > 0) {
          flatten(dept.children, level + 1);
        }
      }
    };
    flatten(deptList, 0);
    return result;
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <span>{t('Registration_Status_Filter')}：</span>
          <Select
            allowClear
            placeholder={t('Registration_All')}
            style={{ width: 120 }}
            value={statusFilter}
            onChange={value => setStatusFilter(value)}
            options={[
              { value: 'pending', label: t('Pending') },
              { value: 'approved', label: t('Approved') },
              { value: 'rejected', label: t('Rejected') },
            ]}
          />
          <Button onClick={loadRegistrations}>{t('refresh_list')}</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={registrations}
        rowKey='id'
        loading={loading}
        scroll={{ y: 400 }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => t('Total_Records', { total }),
        }}
      />

      <Modal
        title={t('Registration_Approve_Title')}
        open={approveModalVisible}
        onOk={handleApproveSubmit}
        onCancel={() => setApproveModalVisible(false)}
        width={500}
      >
        <Form form={approveForm} layout='vertical'>
          <Form.Item name='dept_id' label={t('Admin_Department')}>
            <Select placeholder={t('Admin_Department_Placeholder')} allowClear style={{ width: '100%' }}>
              {flattenDepts(depts).map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  {'　'.repeat(dept.level)}
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name='role_ids' label={t('Admin_Role')}>
            <Select mode='multiple' placeholder={t('Admin_Role_Placeholder')} allowClear style={{ width: '100%' }}>
              {roles.map(role => (
                <Select.Option key={role.id} value={role.id}>
                  {role.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t('Registration_Reject_Title')}
        open={rejectModalVisible}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalVisible(false)}
        width={500}
      >
        <Form form={rejectForm} layout='vertical'>
          <Form.Item
            name='reason'
            label={t('Registration_Reject_Reason')}
            rules={[{ required: true, message: t('Please_Input') }]}
          >
            <Input.TextArea rows={4} placeholder={t('Please_Input')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
