// components/Layout/Header.js

import React, { useContext } from 'react';
import { Menu, Layout } from 'antd';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';

const { Header } = Layout;

const AppHeader = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <Header>
      <div className="logo" style={{ float: 'left', color: 'white', fontSize: '20px' }}>
        <Link to="/" style={{ color: 'white' }}>
          Exchange Rate App
        </Link>
      </div>
      <Menu theme="dark" mode="horizontal" style={{ lineHeight: '64px' }}>
        {user && (
          <>
            <Menu.Item key="home">
              <Link to="/">Ana Sayfa</Link>
            </Menu.Item>
            <Menu.Item key="portfolios">
              <Link to="/portfolios">Portföylerim</Link>
            </Menu.Item>
            <Menu.Item key="logout" onClick={logout}>
              Çıkış Yap
            </Menu.Item>
          </>
        )}
        {!user && (
          <>
            <Menu.Item key="login">
              <Link to="/login">Giriş Yap</Link>
            </Menu.Item>
            <Menu.Item key="register">
              <Link to="/register">Kayıt Ol</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
    </Header>
  );
};

export default AppHeader;
