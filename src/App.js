// App.js

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home/Home';
import PortfolioList from './pages/Portfolio/PortfolioList';
import PortfolioDetail from './pages/Portfolio/PortfolioDetail';
import { AuthContext } from './contexts/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';

import AppHeader from './components/Layout/Header';
import AppFooter from './components/Layout/Footer';
import Sidebar from './components/Layout/Sidebar';

const { Content, Sider } = Layout;

function App() {
  const { user } = React.useContext(AuthContext);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        {user && (
          <Sider width={200} className="site-layout-background">
            <Sidebar />
          </Sider>
        )}
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Özel rotalar */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/portfolios"
                element={
                  <PrivateRoute>
                    <PortfolioList />
                  </PrivateRoute>
                }
              />
              <Route
                path="/portfolio/:id"
                element={
                  <PrivateRoute>
                    <PortfolioDetail />
                  </PrivateRoute>
                }
              />
              {/* Diğer rotalar */}
            </Routes>
          </Content>
          <AppFooter />
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
