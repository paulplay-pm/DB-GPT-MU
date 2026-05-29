'use client';

import { Dropdown, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface MoreMenuProps {
  onRename: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

function MoreMenu({ onRename, onDelete, children }: MoreMenuProps) {
  const { t } = useTranslation();

  const items: MenuProps['items'] = [
    {
      key: 'rename',
      label: t('rename') || '重命名',
      onClick: onRename,
    },
    {
      key: 'delete',
      label: t('delete') || '删除',
      onClick: onDelete,
      danger: true,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement='bottomRight'>
      {children}
    </Dropdown>
  );
}

export default MoreMenu;
