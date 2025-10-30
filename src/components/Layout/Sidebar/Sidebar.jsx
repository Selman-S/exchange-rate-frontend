// src/components/Layout/Sidebar/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  FolderOpenOutlined,
  LineChartOutlined,
  SettingOutlined,
  DashboardOutlined,
  BellOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import './Sidebar.css';

const menuItems = [
  {
    key: 'home',
    path: '/',
    icon: <HomeOutlined />,
    label: 'Ana Sayfa',
  },
  {
    key: 'market',
    path: '/market',
    icon: <DashboardOutlined />,
    label: 'Piyasa',
  },
  {
    key: 'portfolios',
    path: '/portfolios',
    icon: <FolderOpenOutlined />,
    label: 'Portföylerim',
  },
  {
    key: 'alerts',
    path: '/alerts',
    icon: <BellOutlined />,
    label: 'Alarmlar',
  },
  {
    key: 'simulator',
    path: '/simulator',
    icon: <CalculatorOutlined />,
    label: 'Simülatör',
  },
  {
    key: 'comparison',
    path: '/comparison',
    icon: <LineChartOutlined />,
    label: 'Karşılaştırma',
  },
  {
    key: 'reports',
    path: '/reports',
    icon: <LineChartOutlined />,
    label: 'Raporlar',
  },
  {
    key: 'settings',
    path: '/settings',
    icon: <SettingOutlined />,
    label: 'Ayarlar',
  },
];

const Sidebar = ({ collapsed, onCollapse }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={classNames('app-sidebar', { collapsed })}>
      {/* Collapse toggle */}
      <button
        className="sidebar-collapse-btn hidden-mobile"
        onClick={onCollapse}
        title={collapsed ? 'Genişlet' : 'Daralt'}
      >
        <span className={`collapse-icon ${collapsed ? 'collapsed' : ''}`}>
          ◀
        </span>
      </button>

      {/* Menu items */}
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <Link
            key={item.key}
            to={item.path}
            className={classNames('sidebar-menu-item', {
              active: isActive(item.path),
            })}
            title={collapsed ? item.label : ''}
          >
            <span className="menu-item-icon">{item.icon}</span>
            {!collapsed && <span className="menu-item-label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer info (optional) */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="sidebar-footer-text">
            <div className="footer-title">Exchange Rate</div>
            <div className="footer-version">v1.0.0</div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;

