// components/Layout/Sidebar.js

import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <Menu mode="inline" defaultSelectedKeys={['home']} style={{ height: '100%' }}>
      <Menu.Item key="home">
        <Link to="/">Ana Sayfa</Link>
      </Menu.Item>
      <Menu.Item key="portfolios">
        <Link to="/portfolios">Portföylerim</Link>
      </Menu.Item>
      {/* Diğer menü öğeleri eklenebilir */}
    </Menu>
  );
};

export default Sidebar;
