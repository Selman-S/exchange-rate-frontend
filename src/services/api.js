// services/api.js

import axios from 'axios';

const API_URL = process.env.REACT_APP_BASE_URL+'/api';
console.log("API_URL : ",API_URL);

const api = axios.create({
  baseURL: API_URL,
});

// İsteklerden önce Authorization başlığını ekleyin
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Yanıtları ve hataları yakalayın
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Hata yönetimi
    if (error.response && error.response.status === 401) {
      // Yetkilendirme hatası, kullanıcıyı çıkış yapmaya yönlendirin
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
