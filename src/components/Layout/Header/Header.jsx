// src/components/Layout/Header/Header.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Avatar, Badge } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  SearchOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { AuthContext } from '../../../contexts/AuthContext';
import './Header.css';

const AppHeader = ({ onMenuToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchVisible, setSearchVisible] = useState(false);

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      onClick: logout,
      danger: true,
    },
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile menu toggle */}
        <button className="menu-toggle visible-mobile-only" onClick={onMenuToggle}>
          <MenuOutlined />
        </button>

        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="logo-icon">💱</span>
          <span className="logo-text">Exchange Rate</span>
        </Link>
      </div>

      <div className="header-center">
        {/* Search bar (desktop) */}
        <div className={`header-search ${searchVisible ? 'active' : ''}`}>
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Varlık veya portföy ara..."
            className="search-input"
            onFocus={() => setSearchVisible(true)}
            onBlur={() => setSearchVisible(false)}
          />
        </div>
      </div>

      <div className="header-right">
        {user ? (
          <>
            {/* Notifications */}
            <button className="header-icon-btn">
              <Badge count={0} dot>
                <BellOutlined />
              </Badge>
            </button>

            {/* User menu */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="user-avatar-wrapper">
                <Avatar
                  size="default"
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                />
                <span className="user-name hidden-mobile">{user.email?.split('@')[0]}</span>
              </div>
            </Dropdown>
          </>
        ) : (
          <div className="header-auth-buttons">
            <Link to="/login">
              <button className="btn-ghost btn-sm">Giriş Yap</button>
            </Link>
            <Link to="/register">
              <button className="btn-primary btn-sm">Kayıt Ol</button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;

