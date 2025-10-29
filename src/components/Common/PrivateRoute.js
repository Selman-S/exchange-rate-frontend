import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import Loading from './Loading';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  // Yükleniyorsa, bir yükleme göstergesi veya boş bir şey render et
  if (loading) {
    return <Loading fullScreen={true} text="Yükleniyor..." />;
  }

  // 'user' değeri 'null' ise '/login' sayfasına yönlendirir
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
