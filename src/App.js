// App.js

import React, { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';
import MainLayout from './components/Layout/MainLayout';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home/Home';
import MarketPage from './pages/Market/MarketPage';
import PortfolioList from './pages/Portfolio/PortfolioList.jsx';
import PortfolioDetail from './pages/Portfolio/PortfolioDetail.jsx';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <MainLayout showSidebar={!!user}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/market"
          element={
            <PrivateRoute>
              <MarketPage />
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
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <div>Raporlar sayfası (Yakında)</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <div>Ayarlar sayfası (Yakında)</div>
            </PrivateRoute>
          }
        />
      </Routes>
    </MainLayout>
  );
}

export default App;
