// services/auth.js

import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const register = (name, email, password) => {
  return api.post('/auth/register', { name, email, password });
};

export const getMe = () => {
  return api.get('/auth/me');
};

export const changePassword = (currentPassword, newPassword) => {
  return api.put('/auth/change-password', { currentPassword, newPassword });
};

export const changeEmail = (newEmail, password) => {
  return api.put('/auth/change-email', { newEmail, password });
};
