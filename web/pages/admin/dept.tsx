'use client';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Space, Tree, TreeSelect, message } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DeptCreateRequest,
  DeptTreeNode,
  DeptUpdateRequest,
  createDept,
  deleteDept,
  getDeptTree,
  updateDept,
} from '@/client/api/sys/dept';
import PageHeader from '@/new-components/common/PageHeader';
import '@/styles/chatbi-variables.css';

export default function DeptManagementPage() {
  const { t } = useTranslation();
  const [deptTree, setDeptTree] = useState<DeptTreeNode[]>([]);
  const [_loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState(t('Add_Dept'));
  const [editingDept, setEditingDept] = useState<DeptTreeNode | null>(null);
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const loadDeptTree = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDeptTree();
      setDeptTree(data);
    } catch (e: any) {
      message.error(e.message || t('Load_Dept_Failed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadDeptTree();
  }, [loadDeptTree]);

  const convertToTreeData = (depts: DeptTreeNode[]): DataNode[] => {
    return depts.map(dept => ({
      key: dept.id,
      title: dept.name,
      code: dept.code,
      level: dept.level,
      sort: dept.sort,
      children: dept.children && dept.children.length > 0 ? convertToTreeData(dept.children) : undefined,
    }));
  };

  const convertToTreeSelectData = (depts: DeptTreeNode[], excludeId?: number): any[] => {
    return depts
      .filter(d => d.id !== excludeId)
      .map(dept => ({
        value: dept.id,
        title: dept.name,
        children:
          dept.children && dept.children.length > 0 ? convertToTreeSelectData(dept.children, excludeId) : undefined,
      }));
  };

  const findDeptById = (depts: DeptTreeNode[], id: number): DeptTreeNode | null => {
    for (const dept of depts) {
      if (dept.id === id) return dept;
      if (dept.children) {
        const found = findDeptById(dept.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleAdd = (parentId?: number) => {
    setEditingDept(null);
    setModalTitle(t('Add_Dept'));
    form.resetFields();
    if (parentId !== undefined) {
      form.setFieldsValue({ parent_id: parentId });
    }
    setModalVisible(true);
  };

  const handleEdit = (dept: DeptTreeNode) => {
    setEditingDept(dept);
    setModalTitle(t('Edit_Dept'));
    form.setFieldsValue({
      code: dept.code,
      name: dept.name,
      parent_id: dept.parent_id,
      level: dept.level,
      sort: dept.sort,
    });
    setModalVisible(true);
  };

  const handleDelete = async (dept: DeptTreeNode) => {
    Modal.confirm({
      title: t('Delete_Confirm'),
      content: t('Dept_Delete_Confirm', { name: dept.name }),
      onOk: async () => {
        try {
          await deleteDept(dept.id);
          message.success(t('Delete_Success'));
          loadDeptTree();
        } catch (e: any) {
          message.error(e.message || t('Delete_Failed'));
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingDept) {
        await updateDept(editingDept.id, values as DeptUpdateRequest);
        message.success(t('update_success'));
      } else {
        await createDept(values as DeptCreateRequest);
        message.success(t('create_success'));
      }
      setModalVisible(false);
      loadDeptTree();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      message.error(e.message || t('Operation_Failed'));
    }
  };

  const treeData = convertToTreeData(deptTree);
  const treeSelectData = convertToTreeSelectData(deptTree, editingDept?.id);

  return (
    <div className='bg-[var(--bg-primary)] min-h-screen p-6'>
      <PageHeader
        title={t('dept_management')}
        description={t('dept_management')}
        actions={
          <Button type='primary' icon={<PlusOutlined />} onClick={() => handleAdd()} className='rounded-[8px]'>
            {t('Add_Dept')}
          </Button>
        }
      />

      <div className='bg-[var(--card-bg)] rounded-[12px] p-4 shadow-sm'>
        <Tree
          treeData={treeData}
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          defaultExpandAll
          style={{ maxHeight: 400, overflow: 'auto' }}
          titleRender={(nodeData: any) => {
            const dept = findDeptById(deptTree, nodeData.key as number);
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '4px 0',
                }}
              >
                <span>{nodeData.title}</span>
                <Space size='small'>
                  <Button
                    type='text'
                    size='small'
                    icon={<PlusOutlined />}
                    onClick={e => {
                      e.stopPropagation();
                      handleAdd(nodeData.key as number);
                    }}
                  />
                  <Button
                    type='text'
                    size='small'
                    icon={<EditOutlined />}
                    onClick={e => {
                      e.stopPropagation();
                      if (dept) handleEdit(dept);
                    }}
                  />
                  <Button
                    type='text'
                    size='small'
                    danger
                    icon={<DeleteOutlined />}
                    onClick={e => {
                      e.stopPropagation();
                      if (dept) handleDelete(dept);
                    }}
                  />
                </Space>
              </div>
            );
          }}
        />
      </div>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={400}
      >
        <Form form={form} layout='vertical'>
          <Form.Item name='name' label={t('Dept_Name')} rules={[{ required: true, message: t('Dept_Name_Required') }]}>
            <Input placeholder={t('Dept_Name_Required')} />
          </Form.Item>
          <Form.Item name='code' label={t('Dept_Code')} rules={[{ required: true, message: t('Dept_Code_Required') }]}>
            <Input placeholder={t('Dept_Code_Required')} />
          </Form.Item>
          <Form.Item name='parent_id' label={t('Parent_Dept')}>
            <TreeSelect
              style={{ width: '100%' }}
              treeData={treeSelectData}
              placeholder={t('Parent_Dept_Placeholder')}
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name='sort' label={t('Dept_Sort')}>
            <Input type='number' placeholder={t('Dept_Sort_Placeholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
