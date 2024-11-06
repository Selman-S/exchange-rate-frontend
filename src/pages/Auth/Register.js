// pages/Auth/Register.js

import React, { useState, useContext } from 'react';
import { Form, Input, Button, Typography,message } from 'antd';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title } = Typography;

const Register = () => {
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.post('/auth/register', values);
      // Kayıt başarılı, giriş sayfasına yönlendir
      message.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/login');
    } catch (error) {
      // Hata mesajını göster
      console.error('Kayıt hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form" style={{ maxWidth: '400px', margin: 'auto', marginTop: '50px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        Kayıt Ol
      </Title>
      <Form name="register" onFinish={onFinish}>
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Lütfen adınızı girin!' }]}
        >
          <Input placeholder="Adınız" />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Lütfen email girin!' },
            { type: 'email', message: 'Geçerli bir email girin!' },
          ]}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Lütfen şifre girin!' }]}
        >
          <Input.Password placeholder="Şifre" />
        </Form.Item>
        <Form.Item
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Lütfen şifrenizi onaylayın!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject('Şifreler eşleşmiyor!');
              },
            }),
          ]}
        >
          <Input.Password placeholder="Şifreyi Onayla" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Kayıt Ol
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
