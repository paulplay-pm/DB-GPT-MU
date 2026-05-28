'use client';

import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Button, Form, Input, Modal, Select, Space, Table, Tag, TreeSelect, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DeptTreeNode, getDeptTree } from '@/client/api/sys/dept';
import { RoleResponse, getRoles } from '@/client/api/sys/role';
import {
  UserCreateRequest,
  UserResponse,
  UserUpdateRequest,
  createUser,
  getUserRoles,
  getUsers,
  updateUser,
  updateUserRoles,
} from '@/client/api/sys/user';
import PageHeader from '@/new-components/common/PageHeader';
import '@/styles/chatbi-variables.css';

export default function UserManagementPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [deptTree, setDeptTree] = useState<DeptTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState(t('Add_User'));
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
      message.error(e.message || t('Load_User_Failed'));
    } finally {
      setLoading(false);
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

  const loadDeptTree = useCallback(async () => {
    try {
      const data = await getDeptTree();
      setDeptTree(data);
    } catch (e: any) {
      message.error(e.message || t('Load_Dept_Failed'));
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
    loadRoles();
    loadDeptTree();
  }, [loadUsers, loadRoles, loadDeptTree]);

  const loadUserRoles = useCallback(
    async (userId: number) => {
      try {
        const roleIds = await getUserRoles(userId);
        setSelectedRoleIds(roleIds);
      } catch (e: any) {
        message.error(e.message || t('Load_User_Roles_Failed'));
      }
    },
    [t],
  );

  const handleAdd = () => {
    setEditingUser(null);
    setModalTitle(t('Add_User'));
    setSelectedRoleIds([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: UserResponse) => {
    setEditingUser(user);
    setModalTitle(t('Edit_User'));
    setSelectedRoleIds([]);
    form.setFieldsValue({
      login_name: user.login_name,
      real_name: user.real_name,
      email: user.email,
      phone: user.phone,
      dept_id: user.dept_id,
      is_active: user.is_active,
    });
    loadUserRoles(user.id);
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        const updateData: UserUpdateRequest = {
          real_name: values.real_name,
          email: values.email,
          phone: values.phone,
          dept_id: values.dept_id,
          is_active: values.is_active,
        };
        await updateUser(editingUser.id, updateData);
        await updateUserRoles(editingUser.id, selectedRoleIds);
        message.success(t('update_success'));
      } else {
        const createData: UserCreateRequest = {
          user_id: values.user_id,
          login_name: values.login_name,
          password: values.password,
          real_name: values.real_name,
          email: values.email,
          phone: values.phone,
          dept_id: values.dept_id,
        };
        const newUserId = await createUser(createData);
        if (selectedRoleIds.length > 0) {
          await updateUserRoles(newUserId, selectedRoleIds);
        }
        message.success(t('create_success'));
      }
      setModalVisible(false);
      loadUsers();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      const errMsg = e.message || '';
      if (errMsg.includes('already exists') || errMsg.includes('已存在')) {
        message.error(t('User_ID_Exists'));
      } else if (errMsg.includes('not found') || errMsg.includes('不存在')) {
        message.error(t('User_Not_Found'));
      } else {
        message.error(errMsg || t('Operation_Failed'));
      }
    }
  };

  const convertDeptToTreeSelect = (depts: DeptTreeNode[]): { value: number; title: string; children?: any[] }[] => {
    return depts.map(dept => ({
      value: dept.id,
      title: dept.name,
      children: dept.children && dept.children.length > 0 ? convertDeptToTreeSelect(dept.children) : undefined,
    }));
  };

  const columns: TableProps<UserResponse>['columns'] = [
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
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (is_active: boolean) => (
        <Tag color={is_active ? 'green' : 'red'}>{is_active ? t('Admin_Active') : t('Admin_Disabled')}</Tag>
      ),
    },
    {
      title: t('Admin_Super_Admin'),
      dataIndex: 'is_super_admin',
      key: 'is_super_admin',
      width: 120,
      render: (is_super_admin: boolean) => (
        <Tag color={is_super_admin ? 'blue' : 'default'}>{is_super_admin ? t('Admin_Yes') : t('Admin_No')}</Tag>
      ),
    },
    {
      title: t('Admin_Operation'),
      key: 'action',
      width: 100,
      render: (_: any, record: UserResponse) => (
        <Space size='small'>
          <Button type='text' size='small' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
        </Space>
      ),
    },
  ];

  const handleTableChange: TableProps<UserResponse>['onChange'] = pag => {
    setPagination(prev => ({
      ...prev,
      current: pag.current || 1,
      pageSize: pag.pageSize || 20,
    }));
  };

  return (
    <div className='bg-[var(--bg-primary)] min-h-screen p-6'>
      <PageHeader
        title={t('user_management')}
        description={t('user_management')}
        actions={
          <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd} className='rounded-[8px]'>
            {t('Add_User')}
          </Button>
        }
      />

      <div className='bg-[var(--card-bg)] rounded-[12px] p-4 shadow-sm'>
        <Table
          columns={columns}
          dataSource={users}
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
      </div>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout='vertical'>
          {!editingUser && (
            <>
              <Form.Item
                name='user_id'
                label={t('Admin_User_ID')}
                rules={[{ required: true, message: t('Please_input_the_name') }]}
              >
                <Input placeholder={t('Please_input_the_name')} />
              </Form.Item>
              <Form.Item
                name='login_name'
                label={t('Admin_Login_Name')}
                rules={[{ required: true, message: t('Admin_Login_Name_Required') }]}
              >
                <Input placeholder={t('Admin_Login_Name_Required')} />
              </Form.Item>
              <Form.Item
                name='password'
                label={t('Admin_Password')}
                rules={[{ required: true, message: t('Admin_Password_Required') }]}
              >
                <Input.Password placeholder={t('Admin_Password_Required')} />
              </Form.Item>
            </>
          )}
          <Form.Item name='real_name' label={t('Admin_Real_Name_Label')}>
            <Input placeholder={t('Please_input_the_name')} />
          </Form.Item>
          <Form.Item name='email' label={t('Admin_Email_Label')}>
            <Input placeholder={t('Admin_Email')} />
          </Form.Item>
          <Form.Item name='phone' label={t('Admin_Phone_Label')}>
            <Input placeholder={t('Admin_Phone')} />
          </Form.Item>
          <Form.Item name='dept_id' label={t('Admin_Department')}>
            <TreeSelect
              placeholder={t('Admin_Department_Placeholder')}
              treeData={convertDeptToTreeSelect(deptTree)}
              allowClear
              treeDefaultExpandAll
              style={{ width: '100%' }}
            />
          </Form.Item>
          {editingUser && (
            <Form.Item name='is_active' label={t('Admin_Status')}>
              <Select
                options={[
                  { value: true, label: t('Admin_Active') },
                  { value: false, label: t('Admin_Disabled') },
                ]}
                placeholder={t('Admin_Status')}
              />
            </Form.Item>
          )}
          <Form.Item label={t('Admin_Role')}>
            <Select
              mode='multiple'
              open={roleSelectOpen}
              onFocus={() => setRoleSelectOpen(true)}
              onBlur={() => setRoleSelectOpen(false)}
              value={selectedRoleIds}
              onChange={setSelectedRoleIds}
              placeholder={t('Admin_Role_Placeholder')}
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
