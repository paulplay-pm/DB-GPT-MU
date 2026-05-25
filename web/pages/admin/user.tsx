'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, message, Space, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

import {
  getUsers,
  createUser,
  updateUser,
  updateUserRoles,
  UserResponse,
  UserCreateRequest,
  UserUpdateRequest,
} from '@/client/api/sys/user';
import { getRoles, RoleResponse } from '@/client/api/sys/role';

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增用户');
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [form] = Form.useForm();
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (e: any) {
      message.error(e.message || '加载用户失败');
    } finally {
      setLoading(false);
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
    loadUsers();
    loadRoles();
  }, [loadUsers, loadRoles]);

  const handleAdd = () => {
    setEditingUser(null);
    setModalTitle('新增用户');
    setSelectedRoleIds([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: UserResponse) => {
    setEditingUser(user);
    setModalTitle('编辑用户');
    setSelectedRoleIds([]);
    form.setFieldsValue({
      login_name: user.login_name,
      real_name: user.real_name,
      email: user.email,
      dept_id: user.dept_id,
      is_active: user.is_active,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        const updateData: UserUpdateRequest = {
          real_name: values.real_name,
          email: values.email,
          dept_id: values.dept_id,
          is_active: values.is_active,
        };
        await updateUser(editingUser.id, updateData);
        if (selectedRoleIds.length > 0) {
          await updateUserRoles(editingUser.id, selectedRoleIds);
        }
        message.success('更新成功');
      } else {
        const createData: UserCreateRequest = {
          user_id: values.user_id,
          login_name: values.login_name,
          password: values.password,
          real_name: values.real_name,
          email: values.email,
          dept_id: values.dept_id,
        };
        const newUserId = await createUser(createData);
        if (selectedRoleIds.length > 0) {
          await updateUserRoles(newUserId, selectedRoleIds);
        }
        message.success('创建成功');
      }
      setModalVisible(false);
      loadUsers();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      message.error(e.message || '操作失败');
    }
  };

  const columns: TableProps<UserResponse>['columns'] = [
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
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (is_active: boolean) => (
        <Tag color={is_active ? 'green' : 'red'}>
          {is_active ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '超级管理员',
      dataIndex: 'is_super_admin',
      key: 'is_super_admin',
      width: 120,
      render: (is_super_admin: boolean) => (
        <Tag color={is_super_admin ? 'blue' : 'default'}>
          {is_super_admin ? '是' : '否'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: UserResponse) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </Space>
      ),
    },
  ];

  const handleTableChange: TableProps<UserResponse>['onChange'] = (pag) => {
    setPagination(prev => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 20,
    }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          {!editingUser && (
            <>
              <Form.Item
                name="user_id"
                label="用户ID"
                rules={[{ required: true, message: '请输入用户ID' }]}
              >
                <Input placeholder="请输入用户ID" />
              </Form.Item>
              <Form.Item
                name="login_name"
                label="登录名"
                rules={[{ required: true, message: '请输入登录名' }]}
              >
                <Input placeholder="请输入登录名" />
              </Form.Item>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            </>
          )}
          <Form.Item
            name="real_name"
            label="真实姓名"
          >
            <Input placeholder="请输入真实姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="dept_id"
            label="部门ID"
          >
            <Input type="number" placeholder="请输入部门ID" />
          </Form.Item>
          {editingUser && (
            <Form.Item
              name="is_active"
              label="状态"
            >
              <Select
                options={[
                  { value: true, label: '正常' },
                  { value: false, label: '禁用' },
                ]}
                placeholder="请选择状态"
              />
            </Form.Item>
          )}
          <Form.Item
            label="角色"
          >
            <Select
              mode="multiple"
              open={roleSelectOpen}
              onFocus={() => setRoleSelectOpen(true)}
              onBlur={() => setRoleSelectOpen(false)}
              value={selectedRoleIds}
              onChange={setSelectedRoleIds}
              placeholder="请选择角色"
              style={{ width: '100%' }}
              options={roles.map(role => ({
                value: role.id,
                label: role.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}