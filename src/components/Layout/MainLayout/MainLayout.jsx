// src/components/Layout/MainLayout/MainLayout.jsx
import React, { useState } from 'react';
import classNames from 'classnames';
import Header from '../Header';
import Sidebar from '../Sidebar';
import Footer from '../Footer';
import './MainLayout.css';

/**
 * MainLayout Component
 * Ana sayfa layout'u - Header, Sidebar, Content, Footer
 */
const MainLayout = ({ children, showSidebar = true, showFooter = true }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="main-layout">
      {/* Header */}
      <Header onMenuToggle={handleMobileSidebarToggle} />

      <div className="layout-body">
        {/* Sidebar */}
        {showSidebar && (
          <>
            <div className={mobileSidebarOpen ? 'mobile-open' : ''}>
              <Sidebar
                collapsed={sidebarCollapsed}
                onCollapse={handleSidebarCollapse}
              />
            </div>
            {/* Mobile overlay */}
            {mobileSidebarOpen && (
              <div
                className="sidebar-overlay"
                onClick={handleMobileSidebarToggle}
              />
            )}
          </>
        )}

        {/* Main content */}
        <main
          className={classNames('layout-content', {
            'with-sidebar': showSidebar,
            'sidebar-collapsed': sidebarCollapsed,
          })}
        >
          <div className="content-wrapper">{children}</div>
          
          {/* Footer */}
          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

