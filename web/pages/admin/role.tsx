'use client';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps, TreeDataNode } from 'antd';
import { Button, Card, Col, Form, Input, Modal, Row, Space, Table, Tag, Tree, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PermissionTreeNode, getPermissions } from '@/client/api/sys/permission';
import {
  RoleCreateRequest,
  RoleResponse,
  RoleUpdateRequest,
  createRole,
  deleteRole,
  getRolePermissions,
  getRoles,
  updateRole,
  updateRolePermissions,
} from '@/client/api/sys/role';

export default function RoleManagementPage() {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });

  // Permissions state
  const [permissionTree, setPermissionTree] = useState<PermissionTreeNode[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRoles();
      setRoles(data);
      setPagination(prev => ({ ...prev, total: data.length }));
    } catch (e: any) {
      message.error(e.message || t('Load_Role_Failed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadPermissions = useCallback(async () => {
    try {
      const data = await getPermissions();
      setPermissionTree(data);
    } catch (e: any) {
      message.error(e.message || t('Load_Permission_Failed'));
    }
  }, [t]);

  const loadRolePermissions = useCallback(
    async (roleId: number) => {
      try {
        const permIds = await getRolePermissions(roleId);
        setSelectedPermissionIds(permIds);
      } catch (e: any) {
        message.error(e.message || t('Load_Role_Permissions_Failed'));
      }
    },
    [t],
  );

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const handleAdd = () => {
    setEditingRole(null);
    setModalTitle(t('Add_Role'));
    form.resetFields();
    setSelectedPermissionIds([]);
    loadPermissions();
    setModalVisible(true);
  };

  const handleEdit = (role: RoleResponse) => {
    setEditingRole(role);
    setModalTitle(t('Edit_Role'));
    form.setFieldsValue({
      code: role.code,
      name: role.name,
      description: role.description,
    });
    loadPermissions();
    loadRolePermissions(role.id);
    setModalVisible(true);
  };

  const handleDelete = async (role: RoleResponse) => {
    Modal.confirm({
      title: t('Delete_Confirm'),
      content: t('Delete_Role_Confirm', { name: role.name }),
      onOk: async () => {
        try {
          await deleteRole(role.id);
          message.success(t('Delete_Success'));
          loadRoles();
        } catch (e: any) {
          message.error(e.message || t('Delete_Failed'));
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      let roleId: number;

      if (editingRole) {
        const updateData: RoleUpdateRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
        };
        await updateRole(editingRole.id, updateData);
        roleId = editingRole.id;
        message.success(t('update_success'));
      } else {
        const createData: RoleCreateRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
        };
        roleId = await createRole(createData);
        message.success(t('create_success'));
      }

      // Update permissions
      await updateRolePermissions(roleId, selectedPermissionIds);

      setModalVisible(false);
      loadRoles();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      const errMsg = e.message || '';
      if (errMsg.includes('already exists') || errMsg.includes('已存在')) {
        message.error(t('Role_Code_Exists'));
      } else if (errMsg.includes('not found') || errMsg.includes('不存在')) {
        message.error(t('Role_Not_Found'));
      } else {
        message.error(errMsg || t('Operation_Failed'));
      }
    }
  };

  const convertToTreeData = (permissions: PermissionTreeNode[]): TreeDataNode[] => {
    return permissions.map(perm => ({
      key: perm.id,
      title: (
        <div className='flex items-center gap-2'>
          <span>{perm.name}</span>
          <span className='text-xs text-gray-400'>{perm.code}</span>
        </div>
      ),
      children: perm.children && perm.children.length > 0 ? convertToTreeData(perm.children) : undefined,
    }));
  };

  const columns: TableProps<RoleResponse>['columns'] = [
    {
      title: t('Role_Code'),
      dataIndex: 'code',
      key: 'code',
      width: 150,
    },
    {
      title: t('Role_Name'),
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: t('Role_Description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('Admin_Status'),
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (is_active: boolean) => (
        <Tag color={is_active ? 'green' : 'red'}>{is_active ? t('Admin_Active') : t('Admin_Disabled')}</Tag>
      ),
    },
    {
      title: t('Admin_Operation'),
      key: 'action',
      width: 120,
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
          {t('Add_Role')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={roles}
        rowKey='id'
        loading={loading}
        scroll={{ y: 400 }}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => t('Total_Records', { total }),
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout='vertical'>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='code'
                label={t('Role_Code')}
                rules={[{ required: true, message: t('Role_Code_Required') }]}
              >
                <Input placeholder={t('Role_Code_Required')} disabled={!!editingRole} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='name'
                label={t('Role_Name')}
                rules={[{ required: true, message: t('Role_Name_Required') }]}
              >
                <Input placeholder={t('Role_Name_Required')} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name='description' label={t('Role_Description')}>
            <Input.TextArea placeholder={t('Role_Description_Placeholder')} rows={2} />
          </Form.Item>
        </Form>

        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>{t('Assign_Permissions')}</div>
          {permissionTree.length > 0 ? (
            <Card styles={{ body: { maxHeight: 300, overflow: 'auto' } }}>
              <Tree
                checkable
                selectable={false}
                defaultExpandAll
                treeData={convertToTreeData(permissionTree)}
                checkedKeys={selectedPermissionIds}
                onCheck={checked => {
                  if (Array.isArray(checked)) {
                    setSelectedPermissionIds(checked as number[]);
                  }
                }}
              />
            </Card>
          ) : (
            <div className='text-center text-gray-400 py-8'>{t('No_Permission_Data')}</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
