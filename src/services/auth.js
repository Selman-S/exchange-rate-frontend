// services/auth.js

import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (name, email, password) => {
  return api.post('/auth/register', { name, email, password });
};

// Diğer auth işlemleri...
