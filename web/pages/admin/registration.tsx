'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Tag, Select } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

import {
  getRegistrations,
  approveRegistration,
  rejectRegistration,
  RegistrationResponse,
  ApproveRequest,
  RejectRequest,
} from '@/client/api/sys/registration';
import { getDeptTree, DeptTreeNode } from '@/client/api/sys/dept';
import { getRoles, RoleResponse } from '@/client/api/sys/role';

export default function RegistrationManagementPage() {
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
      message.error(e.message || '加载注册申请失败');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  const loadDepts = useCallback(async () => {
    try {
      const data = await getDeptTree();
      setDepts(data);
    } catch (e: any) {
      message.error(e.message || '加载部门失败');
    }
  }, []);

  const loadRoles = useCallback(async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (e: any) {
      message.error(e.message || '加载角色失败');
    }
  }, []);

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
      message.success('审核通过成功');
      setApproveModalVisible(false);
      approveForm.resetFields();
      loadRegistrations();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      message.error(e.message || '操作失败');
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
      message.success('审核拒绝成功');
      setRejectModalVisible(false);
      rejectForm.resetFields();
      loadRegistrations();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      message.error(e.message || '操作失败');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'gold';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已拒绝';
      default: return status;
    }
  };

  const columns: TableProps<RegistrationResponse>['columns'] = [
    {
      title: '登录名',
      dataIndex: 'login_name',
      key: 'login_name',
      width: 150,
    },
    {
      title: '真实姓名',
      dataIndex: 'real_name',
      key: 'real_name',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '拒绝原因',
      dataIndex: 'reject_reason',
      key: 'reject_reason',
      width: 200,
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: RegistrationResponse) => {
        if (record.status !== 'pending') {
          return <span style={{ color: '#999' }}>已处理</span>;
        }
        return (
          <Space size="small">
            <Button
              type="text"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record)}
            >
              通过
            </Button>
            <Button
              type="text"
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record)}
            >
              拒绝
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
          <span>状态筛选：</span>
          <Select
            allowClear
            placeholder="全部"
            style={{ width: 120 }}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: 'pending', label: '待审核' },
              { value: 'approved', label: '已通过' },
              { value: 'rejected', label: '已拒绝' },
            ]}
          />
          <Button onClick={loadRegistrations}>刷新</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={registrations}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      <Modal
        title="审核通过"
        open={approveModalVisible}
        onOk={handleApproveSubmit}
        onCancel={() => setApproveModalVisible(false)}
        width={500}
      >
        <Form form={approveForm} layout="vertical">
          <Form.Item
            name="dept_id"
            label="部门"
          >
            <Select
              placeholder="请选择部门"
              allowClear
              style={{ width: '100%' }}
            >
              {flattenDepts(depts).map(dept => (
                <Select.Option key={dept.id} value={dept.id}>
                  {'　'.repeat(dept.level)}{dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="role_ids"
            label="角色"
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              allowClear
              style={{ width: '100%' }}
            >
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
        title="审核拒绝"
        open={rejectModalVisible}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalVisible(false)}
        width={500}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            name="reason"
            label="拒绝原因"
            rules={[{ required: true, message: '请输入拒绝原因' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入拒绝原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}