import { ChatContext } from '@/app/chat-context';
import { apiInterceptors, getUsableModels } from '@/client/api';
import { MODEL_ICON_MAP } from '@/utils/constants';
import { CaretDownOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { Select } from 'antd';
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

const DEFAULT_ICON_URL = '/models/huggingface.svg';

export function renderModelIcon(model?: string, props?: { width: number; height: number }) {
  const { width, height } = props || {};

  if (!model) return null;

  return (
    <Image
      className='rounded-full border border-gray-200 object-contain bg-white inline-block'
      width={width || 24}
      height={height || 24}
      src={MODEL_ICON_MAP[model]?.icon || DEFAULT_ICON_URL}
      alt='llm'
    />
  );
}

interface ModelSelectorProps {
  onChange?: (val: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onChange }) => {
  const { t } = useTranslation();
  const { model, setModel } = useContext(ChatContext);

  const [modelList, setModelList] = useState<string[]>([]);

  useRequest(async () => await apiInterceptors(getUsableModels()), {
    onSuccess: data => {
      const [, res] = data;
      setModelList(res || []);
    },
  });

  if (modelList.length === 0) {
    return null;
  }

  const handleChange = (val: string) => {
    if (onChange) {
      onChange(val);
    }
    setModel(val);
  };

  return (
    <div className={styles['cus-selector']}>
      <Select
        value={model}
        placeholder={t('choose_model')}
        className='w-48 h-8 rounded-3xl'
        suffixIcon={<CaretDownOutlined className='text-sm text-[#000000]' />}
        onChange={handleChange}
      >
        {modelList.map(item => (
          <Select.Option key={item} value={item}>
            <div className='flex items-center'>
              {renderModelIcon(item)}
              <span className='ml-2'>{MODEL_ICON_MAP[item]?.label || item}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ModelSelector;
