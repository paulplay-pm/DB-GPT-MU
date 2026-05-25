import { STORAGE_USERINFO_KEY } from '@/utils/constants/index';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message } from 'antd';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface LoginForm {
  login_name: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v2/sys/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include', // 重要: 发送 cookie
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem(STORAGE_USERINFO_KEY, JSON.stringify(data.data));
        message.success('登录成功');
        router.push('/');
      } else {
        message.error(data.detail || '登录失败');
      }
    } catch {
      message.error('登录失败');
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
      <Card title='DB-GPT 登录' style={{ width: 400 }}>
        <Form name='login' onFinish={onFinish} autoComplete='off'>
          <Form.Item name='login_name' rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder='用户名' />
          </Form.Item>

          <Form.Item name='password' rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder='密码' />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href='/register'>没有账号？立即注册</a>
        </div>
      </Card>
    </div>
  );
}
