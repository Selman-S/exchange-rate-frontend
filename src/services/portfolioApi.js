// src/services/portfolioApi.js
import api from './api';

/**
 * Tüm portföyleri getirir
 * @returns {Promise}
 */
export const fetchPortfolios = async () => {
  return api.get('/portfolios');
};

/**
 * Belirli bir portföyü getirir
 * @param {string} id - Portföy ID
 * @returns {Promise}
 */
export const fetchPortfolio = async (id) => {
  return api.get(`/portfolios/${id}`);
};

/**
 * Portföy özeti getirir (toplam değer, PNL)
 * @param {string} id - Portföy ID
 * @returns {Promise}
 */
export const fetchPortfolioSummary = async (id) => {
  return api.get(`/portfolios/${id}/summary`);
};

/**
 * Yeni portföy oluşturur
 * @param {Object} data - { name, description }
 * @returns {Promise}
 */
export const createPortfolio = async (data) => {
  return api.post('/portfolios', data);
};

/**
 * Portföy günceller
 * @param {string} id - Portföy ID
 * @param {Object} data - { name, description }
 * @returns {Promise}
 */
export const updatePortfolio = async (id, data) => {
  return api.put(`/portfolios/${id}`, data);
};

/**
 * Portföy siler
 * @param {string} id - Portföy ID
 * @returns {Promise}
 */
export const deletePortfolio = async (id) => {
  return api.delete(`/portfolios/${id}`);
};

/**
 * Portföydeki varlıkları getirir
 * @param {string} portfolioId - Portföy ID
 * @returns {Promise}
 */
export const fetchPortfolioAssets = async (portfolioId) => {
  return api.get(`/portfolios/${portfolioId}/assets`);
};

/**
 * Portföye varlık ekler
 * @param {string} portfolioId - Portföy ID
 * @param {Object} data - { type, name, amount, costPrice, purchaseDate }
 * @returns {Promise}
 */
export const createAsset = async (portfolioId, data) => {
  return api.post(`/portfolios/${portfolioId}/assets`, data);
};

/**
 * Varlık siler
 * @param {string} portfolioId - Portföy ID
 * @param {string} assetId - Varlık ID
 * @returns {Promise}
 */
export const deleteAsset = async (portfolioId, assetId) => {
  return api.delete(`/portfolios/${portfolioId}/assets/${assetId}`);
};

/**
 * Portföy değer serisini getirir (tarihsel performans)
 * @param {string} portfolioId - Portföy ID
 * @param {string} period - Zaman aralığı (1M, 3M, 6M, 1Y, ALL, CUSTOM)
 * @param {Object} customParams - Custom params for CUSTOM period (startDate, endDate)
 * @returns {Promise}
 */
export const fetchPortfolioValueSeries = async (portfolioId, period = '6M', customParams = {}) => {
  const params = { period, ...customParams };
  return api.get(`/portfolios/${portfolioId}/value-series`, { params });
};

/**
 * Portföy işlemlerini getirir (transaction history)
 * @param {string} portfolioId - Portföy ID
 * @param {Object} params - Query parameters (search, side, page, limit)
 * @returns {Promise}
 */
export const fetchTransactions = async (portfolioId, params = {}) => {
  return api.get(`/portfolios/${portfolioId}/transactions`, { params });
};

/**
 * Yeni işlem oluşturur
 * @param {string} portfolioId - Portföy ID
 * @param {Object} data - Transaction data
 * @returns {Promise}
 */
export const createTransaction = async (portfolioId, data) => {
  return api.post(`/portfolios/${portfolioId}/transactions`, data);
};

/**
 * İşlem siler
 * @param {string} portfolioId - Portföy ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise}
 */
export const deleteTransaction = async (portfolioId, transactionId) => {
  return api.delete(`/portfolios/${portfolioId}/transactions/${transactionId}`);
};

