// services/favoriteApi.js

import api from './api';

/**
 * Kullanıcının favorilerini getirir
 */
export const fetchFavorites = async () => {
  const response = await api.get('/favorites');
  return response; // api interceptor zaten .data döndürüyor
};

/**
 * Favori ekler
 */
export const addFavorite = async (assetType, assetName) => {
  const response = await api.post('/favorites', { assetType, assetName });
  return response;
};

/**
 * Favori siler
 */
export const deleteFavorite = async (favoriteId) => {
  const response = await api.delete(`/favorites/${favoriteId}`);
  return response;
};

/**
 * Favorileri yeniden sıralar
 */
export const reorderFavorites = async (favorites) => {
  const response = await api.put('/favorites/reorder', { favorites });
  return response;
};

/**
 * LocalStorage'dan favorileri migrate eder
 */
export const migrateFavorites = async (favorites) => {
  const response = await api.post('/favorites/migrate', { favorites });
  return response;
};

