// pages/Auth/Login.js

import React, { useState, useContext } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { AuthContext } from '../../contexts/AuthContext';

const { Title } = Typography;

const Login = () => {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Giriş başarılı!');
      
    } catch (error) {
      message.error('Giriş başarısız! Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form" style={{ maxWidth: '400px', margin: 'auto', marginTop: '50px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        Giriş Yap
      </Title>
      <Form name="login" onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Lütfen email girin!' }]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Lütfen şifre girin!' }]}
        >
          <Input.Password placeholder="Şifre" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Giriş Yap
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
