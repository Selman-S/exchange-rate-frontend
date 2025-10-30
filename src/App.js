// App.js

import React, { useContext, Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import PrivateRoute from './components/Common/PrivateRoute';
import MainLayout from './components/Layout/MainLayout';
import { Loading } from './components/Common';

// Auth pages - loaded immediately
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Other pages - lazy loaded for better initial load performance
const Home = lazy(() => import('./pages/Home/Home'));
const MarketPage = lazy(() => import('./pages/Market/MarketPage'));
const PortfolioList = lazy(() => import('./pages/Portfolio/PortfolioList.jsx'));
const PortfolioDetail = lazy(() => import('./pages/Portfolio/PortfolioDetail.jsx'));
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));
const ReportsPage = lazy(() => import('./pages/Reports/ReportsPage'));

function App() {
  const { user } = useContext(AuthContext);

  return (
    <MainLayout showSidebar={!!user}>
      <Suspense fallback={<Loading text="Sayfa yükleniyor..." fullScreen />}>
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
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <ReportsPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}

export default App;
