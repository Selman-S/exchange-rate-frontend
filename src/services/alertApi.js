// services/alertApi.js

import api from './api';

/**
 * Kullanıcının alarmlarını getirir
 */
export const fetchAlerts = async (status) => {
  const queryParams = status ? `?status=${status}` : '';
  const response = await api.get(`/alerts${queryParams}`);
  return response;
};

/**
 * Aktif alarmları getirir
 */
export const fetchActiveAlerts = async () => {
  const response = await api.get('/alerts/active');
  return response;
};

/**
 * Yeni alarm oluşturur
 */
export const createAlert = async (data) => {
  const response = await api.post('/alerts', data);
  return response;
};

/**
 * Alarm günceller
 */
export const updateAlert = async (alertId, data) => {
  const response = await api.put(`/alerts/${alertId}`, data);
  return response;
};

/**
 * Alarm siler
 */
export const deleteAlert = async (alertId) => {
  const response = await api.delete(`/alerts/${alertId}`);
  return response;
};

/**
 * Alarm durumunu toggle eder (aktif/pasif)
 */
export const toggleAlert = async (alertId) => {
  const response = await api.post(`/alerts/${alertId}/toggle`);
  return response;
};

