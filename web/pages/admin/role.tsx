'use client';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, Form, Input, Modal, Space, Table, Tag, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';

import {
  RoleCreateRequest,
  RoleResponse,
  RoleUpdateRequest,
  createRole,
  deleteRole,
  getRoles,
  updateRole,
} from '@/client/api/sys/role';

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增角色');
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (e: any) {
      message.error(e.message || '加载角色失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleAdd = () => {
    setEditingRole(null);
    setModalTitle('新增角色');
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: RoleResponse) => {
    setEditingRole(role);
    setModalTitle('编辑角色');
    form.setFieldsValue({
      code: role.code,
      name: role.name,
      description: role.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (role: RoleResponse) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除角色"${role.name}"吗？`,
      onOk: async () => {
        try {
          await deleteRole(role.id);
          message.success('删除成功');
          loadRoles();
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        const updateData: RoleUpdateRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
        };
        await updateRole(editingRole.id, updateData);
        message.success('更新成功');
      } else {
        const createData: RoleCreateRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
        };
        await createRole(createData);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadRoles();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      message.error(e.message || '操作失败');
    }
  };

  const columns: TableProps<RoleResponse>['columns'] = [
    {
      title: '角色编码',
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (is_active: boolean) => <Tag color={is_active ? 'green' : 'red'}>{is_active ? '正常' : '禁用'}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: RoleResponse) => (
        <Space size='small'>
          <Button type='text' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type='text' size='small' danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ];

  const handleTableChange: TableProps<RoleResponse>['onChange'] = pag => {
    setPagination(prev => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 20,
    }));
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
          新增角色
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey='id'
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `共 ${total} 条`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={400}
      >
        <Form form={form} layout='vertical'>
          <Form.Item name='code' label='角色编码' rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input placeholder='请输入角色编码' disabled={!!editingRole} />
          </Form.Item>
          <Form.Item name='name' label='角色名称' rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder='请输入角色名称' />
          </Form.Item>
          <Form.Item name='description' label='描述'>
            <Input.TextArea placeholder='请输入描述' rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
