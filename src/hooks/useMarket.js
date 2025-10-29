// src/hooks/useMarket.js
import { useQuery } from '@tanstack/react-query';
import {
  fetchAllRates,
  fetchRateSeries,
  fetchRateNames,
  fetchLatestRates,
  fetchSparklineData,
} from '../services/marketApi';

/**
 * Tüm oranları getirir
 * @param {Object} params - Query parametreleri
 * @param {Object} options - React Query options
 */
export const useRates = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['rates', params],
    queryFn: () => fetchAllRates(params),
    staleTime: 5 * 60 * 1000, // 5 dakika
    ...options,
  });
};

/**
 * En güncel fiyatları getirir
 * @param {string} type - 'gold' | 'currency' | undefined
 * @param {Object} options - React Query options
 */
export const useLatestRates = (type, options = {}) => {
  return useQuery({
    queryKey: ['rates', 'latest', type],
    queryFn: () => fetchLatestRates(type),
    staleTime: 2 * 60 * 1000, // 2 dakika
    refetchInterval: 5 * 60 * 1000, // 5 dakikada bir otomatik refresh
    ...options,
  });
};

/**
 * Belirli bir varlığın zaman serisini getirir
 * @param {Object} params
 * @param {Object} options
 */
export const useRateSeries = (params, options = {}) => {
  return useQuery({
    queryKey: ['rates', 'series', params],
    queryFn: () => fetchRateSeries(params),
    enabled: !!(params?.type && params?.name && params?.startDate && params?.endDate),
    staleTime: 10 * 60 * 1000, // 10 dakika
    ...options,
  });
};

/**
 * Varlık isimlerini getirir
 * @param {string} type - 'gold' | 'currency'
 * @param {Object} options
 */
export const useRateNames = (type, options = {}) => {
  return useQuery({
    queryKey: ['rates', 'names', type],
    queryFn: () => fetchRateNames(type),
    staleTime: 30 * 60 * 1000, // 30 dakika (isimler nadiren değişir)
    ...options,
  });
};

/**
 * Sparkline verilerini getirir
 * @param {Object} params
 * @param {Object} options
 */
export const useSparklineData = (params, options = {}) => {
  return useQuery({
    queryKey: ['rates', 'sparkline', params],
    queryFn: () => fetchSparklineData(params),
    enabled: !!(params?.type && params?.name),
    staleTime: 5 * 60 * 1000, // 5 dakika
    ...options,
  });
};

