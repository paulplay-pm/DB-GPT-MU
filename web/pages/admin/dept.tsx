'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tree, Button, Modal, Form, Input, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { TreeSelect } from 'antd';
import type { DataNode } from 'antd/es/tree';

import {
  getDeptTree,
  createDept,
  updateDept,
  deleteDept,
  DeptTreeNode,
  DeptCreateRequest,
  DeptUpdateRequest,
} from '@/client/api/sys/dept';

export default function DeptManagementPage() {
  const [deptTree, setDeptTree] = useState<DeptTreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('新增部门');
  const [editingDept, setEditingDept] = useState<DeptTreeNode | null>(null);
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const loadDeptTree = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDeptTree();
      setDeptTree(data);
    } catch (e: any) {
      message.error(e.message || '加载部门失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeptTree();
  }, [loadDeptTree]);

  const convertToTreeData = (depts: DeptTreeNode[]): DataNode[] => {
    return depts.map((dept) => ({
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
      .filter((d) => d.id !== excludeId)
      .map((dept) => ({
        value: dept.id,
        title: dept.name,
        children: dept.children && dept.children.length > 0 ? convertToTreeSelectData(dept.children, excludeId) : undefined,
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
    setModalTitle('新增部门');
    form.resetFields();
    if (parentId !== undefined) {
      form.setFieldsValue({ parent_id: parentId });
    }
    setModalVisible(true);
  };

  const handleEdit = (dept: DeptTreeNode) => {
    setEditingDept(dept);
    setModalTitle('编辑部门');
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
      title: '确认删除',
      content: `确定要删除部门"${dept.name}"吗？`,
      onOk: async () => {
        try {
          await deleteDept(dept.id);
          message.success('删除成功');
          loadDeptTree();
        } catch (e: any) {
          message.error(e.message || '删除失败');
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingDept) {
        await updateDept(editingDept.id, values as DeptUpdateRequest);
        message.success('更新成功');
      } else {
        await createDept(values as DeptCreateRequest);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadDeptTree();
    } catch (e: any) {
      if (e.errorFields) {
        return;
      }
      message.error(e.message || '操作失败');
    }
  };

  const treeData = convertToTreeData(deptTree);
  const treeSelectData = convertToTreeSelectData(deptTree, editingDept?.id);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
          新增部门
        </Button>
      </div>

      <Tree
        treeData={treeData}
        expandedKeys={expandedKeys}
        onExpand={setExpandedKeys}
        defaultExpandAll
        titleRender={(nodeData: any) => {
          const dept = findDeptById(deptTree, nodeData.key as number);
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '4px 0' }}>
              <span>{nodeData.title}</span>
              <Space size="small">
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(nodeData.key as number);
                  }}
                />
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dept) handleEdit(dept);
                  }}
                />
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dept) handleDelete(dept);
                  }}
                />
              </Space>
            </div>
          );
        }}
      />

      <Modal
        title={modalTitle}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={400}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="部门编码"
            rules={[{ required: true, message: '请输入部门编码' }]}
          >
            <Input placeholder="请输入部门编码" />
          </Form.Item>
          <Form.Item name="parent_id" label="上级部门">
            <TreeSelect
              style={{ width: '100%' }}
              treeData={treeSelectData}
              placeholder="请选择上级部门"
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <Input type="number" placeholder="请输入排序值" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}