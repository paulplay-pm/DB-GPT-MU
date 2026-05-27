import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface RegisterForm {
  login_name: string;
  password: string;
  real_name?: string;
  email?: string;
  phone?: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: RegisterForm) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v2/sys/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (data.success) {
        message.success('注册申请已提交，请等待审核');
        router.push('/login');
      } else {
        message.error(data.detail || '注册失败');
      }
    } catch {
      message.error('注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
      }}
    >
      <Card title='用户注册' style={{ width: 400 }}>
        <Form name='register' onFinish={onFinish} autoComplete='off'>
          <Form.Item name='login_name' rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder='用户名' />
          </Form.Item>

          <Form.Item
            name='password'
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder='密码' />
          </Form.Item>

          <Form.Item name='real_name'>
            <Input prefix={<UserOutlined />} placeholder='真实姓名（选填）' />
          </Form.Item>

          <Form.Item name='email' rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder='邮箱（选填）' />
          </Form.Item>

          <Form.Item name='phone'>
            <Input prefix={<PhoneOutlined />} placeholder='手机号（选填）' />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading} block>
              注册
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href='/login'>已有账号？立即登录</a>
        </div>
      </Card>
    </div>
  );
}
