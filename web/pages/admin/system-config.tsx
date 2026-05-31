'use client';

import {
  ApartmentOutlined,
  BellOutlined,
  BgColorsOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  LockOutlined,
  PlusOutlined,
  SettingOutlined,
  SlidersOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Card, Input, InputNumber, Modal, Switch, Tabs, Upload, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BrandConfig, getBrandConfig, updateBrandConfig, uploadLogo } from '@/client/api/request';
import { useBrand } from '@/context/BrandContext';
import PageHeader from '@/new-components/common/PageHeader';
import '@/styles/chatbi-variables.css';

const { Dragger } = Upload;

// Tab keys
type TabKey = 'brand' | 'memory' | 'security' | 'notification' | 'advanced';

interface MemoryStats {
  totalMemories: number;
  todayNew: number;
  coveredUsers: number;
  accuracy: number;
}

interface MemorySettings {
  autoDistillation: boolean;
  distillationFrequency: number;
  confidenceThreshold: number;
  maxMemoriesPerUser: number;
  userPreferences: boolean;
  dataKnowledge: boolean;
  analysisPatterns: boolean;
  businessTerms: boolean;
}

interface SecuritySettings {
  passwordMinLength: number;
  passwordExpiryDays: number;
  loginFailLockCount: number;
  sessionTimeout: number;
  singleDeviceLogin: boolean;
  sqlRowLimit: number;
  disableDDL: boolean;
  sensitiveDataMasking: boolean;
}

interface NotificationSettings {
  smtpServer: string;
  smtpPort: number;
  senderEmail: string;
  senderName: string;
  smtpPassword: string;
  enableSSL: boolean;
  newUserRegistration: boolean;
  userAuditRequest: boolean;
  systemExceptionAlert: boolean;
  datasourceConnectionFailed: boolean;
}

interface SystemInfo {
  version: string;
  deployMode: string;
  pythonVersion: string;
  databaseType: string;
  uptime: string;
  activeUsers: number;
}

export default function SystemConfigPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('brand');

  // Brand config state
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    logo_url: null,
    product_name_zh: 'DB-GPT',
    product_name_en: 'DB-GPT',
    slogan: '开口问数，预见洞察',
    slogan_en: 'Ask Data, Find Insights',
  });
  const [originalBrandConfig, setOriginalBrandConfig] = useState<BrandConfig>({
    logo_url: null,
    product_name_zh: 'DB-GPT',
    product_name_en: 'DB-GPT',
    slogan: '开口问数，预见洞察',
    slogan_en: 'Ask Data, Find Insights',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<FormData | null>(null);

  // Memory settings state (mock)
  const [memoryStats] = useState<MemoryStats>({
    totalMemories: 12847,
    todayNew: 156,
    coveredUsers: 892,
    accuracy: 94.2,
  });
  const [memorySettings, setMemorySettings] = useState<MemorySettings>({
    autoDistillation: true,
    distillationFrequency: 5,
    confidenceThreshold: 0.7,
    maxMemoriesPerUser: 500,
    userPreferences: true,
    dataKnowledge: true,
    analysisPatterns: true,
    businessTerms: false,
  });
  const [originalMemorySettings] = useState<MemorySettings>({ ...memorySettings });

  // Security settings state (mock)
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordMinLength: 8,
    passwordExpiryDays: 90,
    loginFailLockCount: 5,
    sessionTimeout: 120,
    singleDeviceLogin: true,
    sqlRowLimit: 1000,
    disableDDL: true,
    sensitiveDataMasking: false,
  });
  const [originalSecuritySettings] = useState<SecuritySettings>({ ...securitySettings });

  // Notification settings state (mock)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    smtpServer: '',
    smtpPort: 465,
    senderEmail: '',
    senderName: 'DB-GPT 系统',
    smtpPassword: '',
    enableSSL: true,
    newUserRegistration: true,
    userAuditRequest: true,
    systemExceptionAlert: true,
    datasourceConnectionFailed: false,
  });
  const [originalNotificationSettings] = useState<NotificationSettings>({ ...notificationSettings });

  // Brand context
  const { updateBrandConfig: updateBrandContextConfig } = useBrand();

  // System info state (mock)
  const [systemInfo] = useState<SystemInfo>({
    version: 'v1.2.0',
    deployMode: '私有化部署',
    pythonVersion: '3.11.9',
    databaseType: 'MySQL 8.0',
    uptime: '15 天 8 小时',
    activeUsers: 128,
  });

  // Load brand config on mount
  useEffect(() => {
    loadBrandConfig();
  }, []);

  const loadBrandConfig = async () => {
    try {
      const res = await getBrandConfig();
      if (res?.data?.data) {
        const config = res.data.data;
        setBrandConfig(config);
        setOriginalBrandConfig(config);
        if (config.logo_url) {
          setLogoPreview(config.logo_url);
        }
      }
    } catch (e) {
      console.error('Failed to load brand config', e);
    }
  };

  const handleLogoUpload = useCallback(async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      message.error('支持 SVG、PNG、JPG 格式');
      return false;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      message.error('文件过大，最大 2MB');
      return false;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = e => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Prepare FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    setLogoFile(formData);

    return false; // Prevent default upload behavior
  }, []);

  const handleSaveBrand = async () => {
    try {
      const finalConfig = { ...brandConfig };

      // Upload logo first if changed
      if (logoFile) {
        const res = await uploadLogo(logoFile);
        if (res?.data?.logo_url) {
          finalConfig.logo_url = res.data.logo_url;
        }
      }

      // Update brand config
      await updateBrandConfig(finalConfig);
      setOriginalBrandConfig(finalConfig);
      message.success('配置已保存');
      updateBrandContextConfig(finalConfig);
    } catch (e) {
      console.error('Failed to save brand config', e);
      message.error('保存失败');
    }
  };

  const handleResetBrand = () => {
    setBrandConfig({ ...originalBrandConfig });
    setLogoPreview(originalBrandConfig.logo_url);
    setLogoFile(null);
  };

  const handleResetMemory = () => {
    setMemorySettings({ ...originalMemorySettings });
  };

  const handleResetSecurity = () => {
    setSecuritySettings({ ...originalSecuritySettings });
  };

  const handleResetNotification = () => {
    setNotificationSettings({ ...originalNotificationSettings });
  };

  const handleClearAllMemory = () => {
    Modal.confirm({
      title: '确认清除',
      content: '确定要清除所有记忆数据吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        message.success('记忆数据已清除');
      },
    });
  };

  const handleResetSystemConfig = () => {
    Modal.confirm({
      title: '确认重置',
      content: '确定要将所有配置恢复为默认值吗？此操作不可撤销。',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        message.success('系统配置已重置');
      },
    });
  };

  const hasUnsavedChanges = useMemo(() => {
    return (
      JSON.stringify(brandConfig) !== JSON.stringify(originalBrandConfig) ||
      JSON.stringify(memorySettings) !== JSON.stringify(originalMemorySettings) ||
      JSON.stringify(securitySettings) !== JSON.stringify(originalSecuritySettings) ||
      JSON.stringify(notificationSettings) !== JSON.stringify(originalNotificationSettings)
    );
  }, [
    brandConfig,
    originalBrandConfig,
    memorySettings,
    originalMemorySettings,
    securitySettings,
    originalSecuritySettings,
    notificationSettings,
    originalNotificationSettings,
  ]);

  // Tab items
  const tabItems = [
    {
      key: 'brand' as TabKey,
      label: (
        <span className='flex items-center gap-2'>
          <BgColorsOutlined />
          品牌信息
        </span>
      ),
      children: renderBrandTab(),
    },
    {
      key: 'memory' as TabKey,
      label: (
        <span className='flex items-center gap-2'>
          <DashboardOutlined />
          记忆管理
        </span>
      ),
      children: renderMemoryTab(),
    },
    {
      key: 'security' as TabKey,
      label: (
        <span className='flex items-center gap-2'>
          <LockOutlined />
          安全设置
        </span>
      ),
      children: renderSecurityTab(),
    },
    {
      key: 'notification' as TabKey,
      label: (
        <span className='flex items-center gap-2'>
          <BellOutlined />
          通知设置
        </span>
      ),
      children: renderNotificationTab(),
    },
    {
      key: 'advanced' as TabKey,
      label: (
        <span className='flex items-center gap-2'>
          <SlidersOutlined />
          高级设置
        </span>
      ),
      children: renderAdvancedTab(),
    },
  ];

  function renderBrandTab() {
    return (
      <div className='space-y-6'>
        {/* Logo Section */}
        <Card title='Logo 配置'>
          <div className='flex gap-8'>
            {/* Current Logo Preview */}
            <div className='flex flex-col items-center'>
              <p className='text-sm text-[var(--text-secondary)] mb-2'>当前 Logo</p>
              <div className='w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden'>
                {logoPreview ? (
                  <img src={logoPreview} alt='Logo' className='max-w-full max-h-full object-contain' />
                ) : (
                  <SettingOutlined className='text-3xl text-gray-400' />
                )}
              </div>
            </div>

            {/* Upload Area */}
            <div className='flex-1'>
              <p className='text-sm text-[var(--text-secondary)] mb-2'>上传新 Logo</p>
              <Dragger
                accept='.svg,.png,.jpg,.jpeg'
                beforeUpload={handleLogoUpload}
                showUploadList={false}
                className='system-config-dragger'
              >
                <p className='text-lg text-[var(--text-secondary)] mb-2'>
                  <PlusOutlined />
                </p>
                <p className='text-sm text-[var(--text-secondary)]'>点击或拖拽图片到此处</p>
                <p className='text-xs text-[var(--text-tertiary)] mt-1'>支持 SVG、PNG、JPG，建议尺寸 64×64px</p>
              </Dragger>
            </div>
          </div>
        </Card>

        {/* Product Name Section */}
        <Card title='产品名称'>
          <div className='grid grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm text-[var(--text-secondary)] mb-1'>中文名称</label>
              <Input
                value={brandConfig.product_name_zh}
                onChange={e => setBrandConfig({ ...brandConfig, product_name_zh: e.target.value })}
                placeholder='显示在导航栏、登录页、浏览器标题'
              />
              <p className='text-xs text-[var(--text-tertiary)] mt-1'>显示在导航栏、登录页、浏览器标题</p>
            </div>
            <div>
              <label className='block text-sm text-[var(--text-secondary)] mb-1'>英文名称</label>
              <Input
                value={brandConfig.product_name_en}
                onChange={e => setBrandConfig({ ...brandConfig, product_name_en: e.target.value })}
                placeholder='用于 API 响应、系统日志等场景'
              />
              <p className='text-xs text-[var(--text-tertiary)] mt-1'>用于 API 响应、系统日志等场景</p>
            </div>
          </div>
        </Card>

        {/* Slogan Section */}
        <Card title='系统标语'>
          <div className='grid grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm text-[var(--text-secondary)] mb-1'>中文标语</label>
              <Input
                value={brandConfig.slogan}
                onChange={e => setBrandConfig({ ...brandConfig, slogan: e.target.value })}
                placeholder='建议不超过 20 个字符'
                maxLength={50}
              />
              <p className='text-xs text-[var(--text-tertiary)] mt-1'>显示在对话首页中央</p>
            </div>
            <div>
              <label className='block text-sm text-[var(--text-secondary)] mb-1'>English Slogan</label>
              <Input
                value={brandConfig.slogan_en}
                onChange={e => setBrandConfig({ ...brandConfig, slogan_en: e.target.value })}
                placeholder='No more than 20 characters'
                maxLength={50}
              />
              <p className='text-xs text-[var(--text-tertiary)] mt-1'>Displayed on chat homepage</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function renderMemoryTab() {
    return (
      <div className='space-y-6'>
        {/* Stats Cards */}
        <div className='grid grid-cols-4 gap-4'>
          <Card className='!bg-blue-50 border-blue-200'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-blue-600'>{memoryStats.totalMemories.toLocaleString()}</p>
              <p className='text-sm text-blue-600 mt-1'>总记忆条数</p>
            </div>
          </Card>
          <Card className='!bg-green-50 border-green-200'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-green-600'>{memoryStats.todayNew}</p>
              <p className='text-sm text-green-600 mt-1'>今日新增</p>
            </div>
          </Card>
          <Card className='!bg-purple-50 border-purple-200'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-purple-600'>{memoryStats.coveredUsers}</p>
              <p className='text-sm text-purple-600 mt-1'>覆盖用户数</p>
            </div>
          </Card>
          <Card className='!bg-orange-50 border-orange-200'>
            <div className='text-center'>
              <p className='text-2xl font-bold text-orange-600'>{memoryStats.accuracy}%</p>
              <p className='text-sm text-orange-600 mt-1'>准确率</p>
            </div>
          </Card>
        </div>

        {/* Distillation Strategy */}
        <Card title='蒸馏策略'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>自动蒸馏开关</p>
                <p className='text-sm text-[var(--text-tertiary)]'>开启后系统将自动从对话中提取记忆</p>
              </div>
              <Switch
                checked={memorySettings.autoDistillation}
                onChange={checked => setMemorySettings({ ...memorySettings, autoDistillation: checked })}
              />
            </div>

            <div className='grid grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm text-[var(--text-secondary)] mb-1'>蒸馏触发频率</label>
                <InputNumber
                  min={1}
                  max={50}
                  value={memorySettings.distillationFrequency}
                  onChange={value => setMemorySettings({ ...memorySettings, distillationFrequency: value || 5 })}
                  className='w-full'
                />
                <p className='text-xs text-[var(--text-tertiary)] mt-1'>每 N 轮对话触发一次（1-50）</p>
              </div>
              <div>
                <label className='block text-sm text-[var(--text-secondary)] mb-1'>记忆置信度阈值</label>
                <InputNumber
                  min={0}
                  max={1}
                  step={0.05}
                  value={memorySettings.confidenceThreshold}
                  onChange={value => setMemorySettings({ ...memorySettings, confidenceThreshold: value || 0.7 })}
                  className='w-full'
                />
                <p className='text-xs text-[var(--text-tertiary)] mt-1'>低于此阈值的记忆将被自动丢弃（0-1）</p>
              </div>
              <div>
                <label className='block text-sm text-[var(--text-secondary)] mb-1'>单用户最大记忆数</label>
                <InputNumber
                  min={50}
                  max={5000}
                  value={memorySettings.maxMemoriesPerUser}
                  onChange={value => setMemorySettings({ ...memorySettings, maxMemoriesPerUser: value || 500 })}
                  className='w-full'
                />
                <p className='text-xs text-[var(--text-tertiary)] mt-1'>超过上限时自动淘汰最久未使用的（50-5000）</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Memory Types */}
        <Card title='记忆分类'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <UserOutlined className='text-blue-500 text-xl' />
                <div>
                  <p className='font-medium'>用户偏好</p>
                  <p className='text-sm text-[var(--text-tertiary)]'>常用数据源、偏好的图表类型、分析习惯</p>
                </div>
              </div>
              <Switch
                checked={memorySettings.userPreferences}
                onChange={checked => setMemorySettings({ ...memorySettings, userPreferences: checked })}
              />
            </div>
            <div className='flex items-center justify-between p-3 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <DatabaseOutlined className='text-green-500 text-xl' />
                <div>
                  <p className='font-medium'>数据知识</p>
                  <p className='text-sm text-[var(--text-tertiary)]'>常用表名、字段含义、业务口径定义</p>
                </div>
              </div>
              <Switch
                checked={memorySettings.dataKnowledge}
                onChange={checked => setMemorySettings({ ...memorySettings, dataKnowledge: checked })}
              />
            </div>
            <div className='flex items-center justify-between p-3 border-b border-gray-100'>
              <div className='flex items-center gap-3'>
                <FileTextOutlined className='text-purple-500 text-xl' />
                <div>
                  <p className='font-medium'>分析模式</p>
                  <p className='text-sm text-[var(--text-tertiary)]'>常用的分析维度、对比方式、筛选条件</p>
                </div>
              </div>
              <Switch
                checked={memorySettings.analysisPatterns}
                onChange={checked => setMemorySettings({ ...memorySettings, analysisPatterns: checked })}
              />
            </div>
            <div className='flex items-center justify-between p-3'>
              <div className='flex items-center gap-3'>
                <ApartmentOutlined className='text-orange-500 text-xl' />
                <div>
                  <p className='font-medium'>业务术语</p>
                  <p className='text-sm text-[var(--text-tertiary)]'>用户自定义的业务术语和缩写映射</p>
                </div>
              </div>
              <Switch
                checked={memorySettings.businessTerms}
                onChange={checked => setMemorySettings({ ...memorySettings, businessTerms: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card title='记忆管理操作'>
          <div className='flex gap-4'>
            <Button>查看全部记忆</Button>
            <Button>手动触发蒸馏</Button>
            <Button danger onClick={handleClearAllMemory}>
              清除全部记忆
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  function renderSecurityTab() {
    return (
      <div className='space-y-6'>
        {/* Password Policy */}
        <Card title='密码策略'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>密码最小长度</p>
                <p className='text-sm text-[var(--text-tertiary)]'>用户密码至少需要包含的字符数</p>
              </div>
              <InputNumber
                min={6}
                max={32}
                value={securitySettings.passwordMinLength}
                onChange={value => setSecuritySettings({ ...securitySettings, passwordMinLength: value || 8 })}
                className='w-24 text-center'
              />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>密码过期天数</p>
                <p className='text-sm text-[var(--text-tertiary)]'>超过天数后强制用户修改密码，0 表示永不过期</p>
              </div>
              <InputNumber
                min={0}
                max={365}
                value={securitySettings.passwordExpiryDays}
                onChange={value => setSecuritySettings({ ...securitySettings, passwordExpiryDays: value || 90 })}
                className='w-24 text-center'
              />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>登录失败锁定次数</p>
                <p className='text-sm text-[var(--text-tertiary)]'>连续登录失败 N 次后锁定账户</p>
              </div>
              <InputNumber
                min={3}
                max={20}
                value={securitySettings.loginFailLockCount}
                onChange={value => setSecuritySettings({ ...securitySettings, loginFailLockCount: value || 5 })}
                className='w-24 text-center'
              />
            </div>
          </div>
        </Card>

        {/* Session Security */}
        <Card title='会话安全'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>会话超时时间（分钟）</p>
                <p className='text-sm text-[var(--text-tertiary)]'>用户无操作超过该时间后自动退出登录</p>
              </div>
              <InputNumber
                min={10}
                max={1440}
                value={securitySettings.sessionTimeout}
                onChange={value => setSecuritySettings({ ...securitySettings, sessionTimeout: value || 120 })}
                className='w-24 text-center'
              />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>单设备登录限制</p>
                <p className='text-sm text-[var(--text-tertiary)]'>开启后同一账号仅允许在一个设备上登录</p>
              </div>
              <Switch
                checked={securitySettings.singleDeviceLogin}
                onChange={checked => setSecuritySettings({ ...securitySettings, singleDeviceLogin: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Data Security */}
        <Card title='数据安全'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>SQL 查询结果行数限制</p>
                <p className='text-sm text-[var(--text-tertiary)]'>单次 SQL 查询返回的最大行数</p>
              </div>
              <InputNumber
                min={100}
                max={100000}
                value={securitySettings.sqlRowLimit}
                onChange={value => setSecuritySettings({ ...securitySettings, sqlRowLimit: value || 1000 })}
                className='w-32 text-center'
              />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>禁止执行 DDL 语句</p>
                <p className='text-sm text-[var(--text-tertiary)]'>阻止 DROP、ALTER、CREATE 等修改表结构的操作</p>
              </div>
              <Switch
                checked={securitySettings.disableDDL}
                onChange={checked => setSecuritySettings({ ...securitySettings, disableDDL: checked })}
              />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>敏感数据脱敏</p>
                <p className='text-sm text-[var(--text-tertiary)]'>对手机号、身份证号等字段自动脱敏显示</p>
              </div>
              <Switch
                checked={securitySettings.sensitiveDataMasking}
                onChange={checked => setSecuritySettings({ ...securitySettings, sensitiveDataMasking: checked })}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function renderNotificationTab() {
    return (
      <div className='space-y-6'>
        {/* SMTP Configuration */}
        <Card title='邮件通知'>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm text-[var(--text-secondary)] mb-1'>SMTP 服务器</label>
                <Input
                  value={notificationSettings.smtpServer}
                  onChange={e => setNotificationSettings({ ...notificationSettings, smtpServer: e.target.value })}
                  placeholder='例如：smtp.example.com'
                />
              </div>
              <div>
                <label className='block text-sm text-[var(--text-secondary)] mb-1'>SMTP 端口</label>
                <InputNumber
                  value={notificationSettings.smtpPort}
                  onChange={value => setNotificationSettings({ ...notificationSettings, smtpPort: value || 465 })}
                  className='w-full'
                />
              </div>
            </div>
            <div>
              <label className='block text-sm text-[var(--text-secondary)] mb-1'>发件人邮箱</label>
              <Input
                value={notificationSettings.senderEmail}
                onChange={e => setNotificationSettings({ ...notificationSettings, senderEmail: e.target.value })}
                placeholder='例如：noreply@example.com'
              />
            </div>
            <div>
              <label className='block text-sm text-[var(--text-secondary)] mb-1'>发件人名称</label>
              <Input
                value={notificationSettings.senderName}
                onChange={e => setNotificationSettings({ ...notificationSettings, senderName: e.target.value })}
                placeholder='默认 DB-GPT 系统'
              />
            </div>
            <div>
              <label className='block text-sm text-[var(--text-secondary)] mb-1'>SMTP 密码</label>
              <Input.Password
                value={notificationSettings.smtpPassword}
                onChange={e => setNotificationSettings({ ...notificationSettings, smtpPassword: e.target.value })}
                placeholder='SMTP 授权码'
              />
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>启用 SSL/TLS 加密</p>
                <p className='text-sm text-[var(--text-tertiary)]'>推荐开启以确保邮件传输安全</p>
              </div>
              <Switch
                checked={notificationSettings.enableSSL}
                onChange={checked => setNotificationSettings({ ...notificationSettings, enableSSL: checked })}
              />
            </div>
          </div>
        </Card>

        {/* Notification Scenes */}
        <Card title='通知场景'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between p-3 border-b border-gray-100'>
              <p className='font-medium'>新用户注册</p>
              <Switch
                checked={notificationSettings.newUserRegistration}
                onChange={checked => setNotificationSettings({ ...notificationSettings, newUserRegistration: checked })}
              />
            </div>
            <div className='flex items-center justify-between p-3 border-b border-gray-100'>
              <p className='font-medium'>用户审核请求</p>
              <Switch
                checked={notificationSettings.userAuditRequest}
                onChange={checked => setNotificationSettings({ ...notificationSettings, userAuditRequest: checked })}
              />
            </div>
            <div className='flex items-center justify-between p-3 border-b border-gray-100'>
              <p className='font-medium'>系统异常告警</p>
              <Switch
                checked={notificationSettings.systemExceptionAlert}
                onChange={checked =>
                  setNotificationSettings({ ...notificationSettings, systemExceptionAlert: checked })
                }
              />
            </div>
            <div className='flex items-center justify-between p-3'>
              <p className='font-medium'>数据源连接失败</p>
              <Switch
                checked={notificationSettings.datasourceConnectionFailed}
                onChange={checked =>
                  setNotificationSettings({ ...notificationSettings, datasourceConnectionFailed: checked })
                }
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function renderAdvancedTab() {
    return (
      <div className='space-y-6'>
        {/* System Maintenance */}
        <Card title='系统维护'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>清除系统缓存</p>
                <p className='text-sm text-[var(--text-tertiary)]'>清除模型缓存、查询缓存等，不会影响数据</p>
              </div>
              <Button>执行</Button>
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>重建语义索引</p>
                <p className='text-sm text-[var(--text-tertiary)]'>重新构建数据源的语义索引，提升查询准确度</p>
              </div>
              <Button>执行</Button>
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <p className='font-medium'>重置系统配置</p>
                <p className='text-sm text-[var(--text-tertiary)]'>将所有配置恢复为默认值，此操作不可撤销</p>
              </div>
              <Button danger onClick={handleResetSystemConfig}>
                执行
              </Button>
            </div>
          </div>
        </Card>

        {/* System Info */}
        <Card title='系统信息'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex justify-between p-3 bg-gray-50 rounded'>
              <span className='text-[var(--text-secondary)]'>系统版本</span>
              <span className='font-medium'>{systemInfo.version}</span>
            </div>
            <div className='flex justify-between p-3 bg-gray-50 rounded'>
              <span className='text-[var(--text-secondary)]'>部署模式</span>
              <span className='font-medium'>{systemInfo.deployMode}</span>
            </div>
            <div className='flex justify-between p-3 bg-gray-50 rounded'>
              <span className='text-[var(--text-secondary)]'>Python 版本</span>
              <span className='font-medium'>{systemInfo.pythonVersion}</span>
            </div>
            <div className='flex justify-between p-3 bg-gray-50 rounded'>
              <span className='text-[var(--text-secondary)]'>数据库类型</span>
              <span className='font-medium'>{systemInfo.databaseType}</span>
            </div>
            <div className='flex justify-between p-3 bg-gray-50 rounded'>
              <span className='text-[var(--text-secondary)]'>运行时间</span>
              <span className='font-medium'>{systemInfo.uptime}</span>
            </div>
            <div className='flex justify-between p-3 bg-gray-50 rounded'>
              <span className='text-[var(--text-secondary)]'>活跃用户数</span>
              <span className='font-medium'>{systemInfo.activeUsers}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const handleSave = () => {
    if (activeTab === 'brand') {
      handleSaveBrand();
    } else {
      message.success('配置已保存');
    }
  };

  return (
    <div className='bg-[var(--bg-primary)] min-h-screen p-6 pb-20 overflow-auto'>
      {/* Page Header with i18n title and description */}
      <PageHeader title={t('system_config')} description={t('system_config_description')} />

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={key => setActiveTab(key as TabKey)}
        items={tabItems}
        className='system-config-tabs'
      />

      {/* Bottom Action Bar - inside page flow, not fixed */}
      <div className='mt-6 bg-[var(--card-bg)] border-t border-[var(--border)] px-6 py-4 flex items-center justify-between'>
        <div className='text-sm text-[var(--text-secondary)]'>
          {hasUnsavedChanges ? '修改后需点击保存，部分配置需重启服务后生效' : '暂无未保存的修改'}
        </div>
        <div className='flex gap-3'>
          <Button
            onClick={() => {
              if (activeTab === 'brand') handleResetBrand();
              else if (activeTab === 'memory') handleResetMemory();
              else if (activeTab === 'security') handleResetSecurity();
              else if (activeTab === 'notification') handleResetNotification();
            }}
            disabled={!hasUnsavedChanges}
          >
            重置
          </Button>
          <Button type='primary' onClick={handleSave}>
            保存配置
          </Button>
        </div>
      </div>
    </div>
  );
}
