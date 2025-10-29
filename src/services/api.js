// src/services/api.js
import axios from 'axios';

// Axios instance oluştur
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Sunucu hata yanıtı
      const { status, data } = error.response;
      
      // 401 - Unauthorized
      if (status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Hata mesajını döndür
      return Promise.reject(data.error || 'Bir hata oluştu');
    } else if (error.request) {
      // İstek gönderildi ama yanıt alınamadı
      return Promise.reject('Sunucuya ulaşılamıyor');
    } else {
      // İstek oluşturulurken hata oluştu
      return Promise.reject('İstek oluşturulurken hata oluştu');
    }
  }
);

export default api;
