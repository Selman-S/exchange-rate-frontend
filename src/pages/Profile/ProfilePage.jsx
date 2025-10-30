// src/pages/Profile/ProfilePage.jsx
import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword, changeEmail } from '../../services/auth';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [passwordForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  // Şifre değiştirme
  const handlePasswordChange = async (values) => {
    try {
      setLoadingPassword(true);
      await changePassword(values.currentPassword, values.newPassword);
      message.success('Şifreniz başarıyla değiştirildi');
      passwordForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Şifre değiştirilemedi');
    } finally {
      setLoadingPassword(false);
    }
  };

  // Email değiştirme
  const handleEmailChange = async (values) => {
    try {
      setLoadingEmail(true);
      const response = await changeEmail(values.newEmail, values.password);
      message.success('Email adresiniz başarıyla değiştirildi');
      
      // Context'teki user'ı güncelle
      if (response.data) {
        setUser(response.data);
      }
      
      emailForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Email değiştirilemedi');
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="page-title">Profil Ayarları</h1>
        <p className="page-description">Hesap bilgilerinizi yönetin</p>
      </div>

      <div className="profile-content">
        {/* Kullanıcı Bilgileri */}
        <Card 
          title={
            <span>
              <UserOutlined /> Kullanıcı Bilgileri
            </span>
          }
          className="profile-card"
        >
          <div className="info-group">
            <label className="info-label">Email</label>
            <div className="info-value">{user?.email}</div>
          </div>
          <div className="info-group">
            <label className="info-label">Hesap Oluşturma</label>
            <div className="info-value">
              {user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : '-'
              }
            </div>
          </div>
        </Card>

        {/* Şifre Değiştirme */}
        <Card
          title={
            <span>
              <LockOutlined /> Şifre Değiştir
            </span>
          }
          className="profile-card"
        >
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handlePasswordChange}
            autoComplete="off"
          >
            <Form.Item
              label="Mevcut Şifre"
              name="currentPassword"
              rules={[
                { required: true, message: 'Mevcut şifrenizi girin' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mevcut şifreniz"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Yeni Şifre"
              name="newPassword"
              rules={[
                { required: true, message: 'Yeni şifrenizi girin' },
                { min: 6, message: 'Şifre en az 6 karakter olmalıdır' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Yeni şifreniz"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Yeni Şifre (Tekrar)"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Yeni şifrenizi tekrar girin' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Şifreler eşleşmiyor'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Yeni şifrenizi tekrar girin"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingPassword}
                size="large"
                block
              >
                Şifreyi Değiştir
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Email Değiştirme */}
        <Card
          title={
            <span>
              <MailOutlined /> Email Değiştir
            </span>
          }
          className="profile-card"
        >
          <Form
            form={emailForm}
            layout="vertical"
            onFinish={handleEmailChange}
            autoComplete="off"
          >
            <Form.Item
              label="Yeni Email"
              name="newEmail"
              rules={[
                { required: true, message: 'Yeni email adresinizi girin' },
                { type: 'email', message: 'Geçerli bir email adresi girin' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="yeni@email.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Şifre (Doğrulama)"
              name="password"
              rules={[
                { required: true, message: 'Şifrenizi girin' },
              ]}
              extra="Güvenlik için mevcut şifrenizi girin"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mevcut şifreniz"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loadingEmail}
                size="large"
                block
              >
                Email'i Değiştir
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;

