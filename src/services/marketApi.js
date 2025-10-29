// src/services/marketApi.js
import api from './api';

/**
 * Tüm oranları getirir
 * @param {Object} params - Query parametreleri
 * @param {string} params.type - 'gold' | 'currency' | undefined (hepsi)
 * @param {string} params.startDate - Başlangıç tarihi (YYYY-MM-DD)
 * @param {string} params.endDate - Bitiş tarihi (YYYY-MM-DD)
 * @returns {Promise}
 */
export const fetchAllRates = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  if (params.type) queryParams.append('type', params.type);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  
  const queryString = queryParams.toString();
  const url = `/rates${queryString ? `?${queryString}` : ''}`;
  
  return api.get(url);
};

/**
 * Belirli bir varlığın zaman serisini getirir
 * @param {Object} params
 * @param {string} params.type - 'gold' | 'currency'
 * @param {string} params.name - Varlık adı (örn: "Amerikan Doları")
 * @param {string} params.startDate - Başlangıç tarihi
 * @param {string} params.endDate - Bitiş tarihi
 * @returns {Promise}
 */
export const fetchRateSeries = async ({ type, name, startDate, endDate }) => {
  const queryParams = new URLSearchParams({
    type,
    name,
    startDate,
    endDate,
  });
  
  return api.get(`/rates?${queryParams.toString()}`);
};

/**
 * Varlık isimlerini getirir
 * @param {string} type - 'gold' | 'currency'
 * @returns {Promise}
 */
export const fetchRateNames = async (type) => {
  const queryParams = type ? `?type=${type}` : '';
  return api.get(`/rates/names${queryParams}`);
};

/**
 * Belirli bir tarihteki fiyatı getirir
 * @param {Object} params
 * @param {string} params.type - 'gold' | 'currency'
 * @param {string} params.name - Varlık adı
 * @param {string} params.date - Tarih (YYYY-MM-DD)
 * @returns {Promise}
 */
export const fetchPriceAtDate = async ({ type, name, date }) => {
  const queryParams = new URLSearchParams({ type, name, date });
  return api.get(`/rates/price-at?${queryParams.toString()}`);
};

/**
 * En güncel fiyatları getirir (database'deki en son tarih)
 * @param {string} type - 'gold' | 'currency' | undefined
 * @returns {Promise}
 * 
 * Not: startDate/endDate göndermeyerek backend'in en son tarihli
 * kayıtları otomatik olarak döndürmesini sağlıyoruz
 */
export const fetchLatestRates = async (type) => {
  const params = {};
  
  // Sadece type varsa ekle
  if (type) {
    params.type = type;
  }
  
  // startDate/endDate GÖNDERMİYORUZ
  // Backend otomatik olarak en son tarihli kayıtları döndürecek
  return fetchAllRates(params);
};

/**
 * Sparkline için son N günün verilerini getirir
 * @param {Object} params
 * @param {string} params.type - 'gold' | 'currency'
 * @param {string} params.name - Varlık adı
 * @param {number} params.days - Gün sayısı (varsayılan: 7)
 * @returns {Promise}
 */
export const fetchSparklineData = async ({ type, name, days = 7 }) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return fetchRateSeries({
    type,
    name,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  });
};

