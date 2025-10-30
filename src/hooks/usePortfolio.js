// src/hooks/usePortfolio.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPortfolios,
  fetchPortfolio,
  fetchPortfolioSummary,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  fetchPortfolioAssets,
  fetchPortfolioValueSeries,
  createAsset,
  deleteAsset,
  fetchTransactions,
  createTransaction,
  deleteTransaction,
} from '../services/portfolioApi';

/**
 * Tüm portföyleri getirir
 */
export const usePortfolios = (options = {}) => {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: fetchPortfolios,
    staleTime: 2 * 60 * 1000, // 2 dakika
    ...options,
  });
};

/**
 * Belirli bir portföyü getirir
 */
export const usePortfolio = (id, options = {}) => {
  return useQuery({
    queryKey: ['portfolios', id],
    queryFn: () => fetchPortfolio(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Portföy özetini getirir
 */
export const usePortfolioSummary = (id, options = {}) => {
  return useQuery({
    queryKey: ['portfolios', id, 'summary'],
    queryFn: () => fetchPortfolioSummary(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 dakika
    ...options,
  });
};

/**
 * Portföydeki varlıkları getirir
 */
export const usePortfolioAssets = (portfolioId, options = {}) => {
  return useQuery({
    queryKey: ['portfolios', portfolioId, 'assets'],
    queryFn: () => fetchPortfolioAssets(portfolioId),
    enabled: !!portfolioId,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

/**
 * Portföy değer serisini getirir (tarihsel performans)
 */
export const usePortfolioValueSeries = (portfolioId, period = '6M', customParams = {}, options = {}) => {
  return useQuery({
    queryKey: ['portfolios', portfolioId, 'value-series', period, customParams],
    queryFn: () => fetchPortfolioValueSeries(portfolioId, period, customParams),
    enabled: !!portfolioId,
    staleTime: 5 * 60 * 1000, // 5 dakika (tarihsel veri sık değişmez)
    ...options,
  });
};

/**
 * Yeni portföy oluşturma mutation
 */
export const useCreatePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => {
      // Portföy listesini invalidate et
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
};

/**
 * Portföy güncelleme mutation
 */
export const useUpdatePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updatePortfolio(id, data),
    onSuccess: (_, variables) => {
      // İlgili portföyü ve listeyi invalidate et
      queryClient.invalidateQueries({ queryKey: ['portfolios', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
};

/**
 * Portföy silme mutation
 */
export const useDeletePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePortfolio,
    onSuccess: () => {
      // Portföy listesini invalidate et
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
};

/**
 * Varlık ekleme mutation
 */
export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, data }) => createAsset(portfolioId, data),
    onSuccess: (_, variables) => {
      // Portföy asset'lerini ve summary'yi invalidate et
      queryClient.invalidateQueries({ queryKey: ['portfolios', variables.portfolioId, 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolios', variables.portfolioId, 'summary'] });
    },
  });
};

/**
 * Varlık silme mutation
 */
export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, assetId }) => deleteAsset(portfolioId, assetId),
    onSuccess: (_, variables) => {
      // Portföy asset'lerini ve summary'yi invalidate et
      queryClient.invalidateQueries({ queryKey: ['portfolios', variables.portfolioId, 'assets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolios', variables.portfolioId, 'summary'] });
    },
  });
};

/**
 * Portföy işlemlerini getirir (transaction history)
 */
export const useTransactions = (portfolioId, params = {}, options = {}) => {
  return useQuery({
    queryKey: ['portfolios', portfolioId, 'transactions', params],
    queryFn: () => fetchTransactions(portfolioId, params),
    enabled: !!portfolioId,
    staleTime: 1 * 60 * 1000, // 1 dakika
    ...options,
  });
};

/**
 * Yeni işlem oluşturma mutation
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, data }) => createTransaction(portfolioId, data),
    onSuccess: (_, variables) => {
      // İşlem listesini invalidate et
      queryClient.invalidateQueries({ queryKey: ['portfolios', variables.portfolioId, 'transactions'] });
      // Özet bilgilerini de invalidate et (değer değişebilir)
      queryClient.invalidateQueries({ queryKey: ['portfolios', variables.portfolioId, 'summary'] });
    },
  });
};

/**
 * İşlem silme mutation
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ portfolioId, transactionId }) => deleteTransaction(portfolioId, transactionId),
    onSuccess: (_, variables) => {
      // İşlem listesini invalidate et
      queryClient.invalidateQueries({ queryKey: ['portfolios', variables.portfolioId, 'transactions'] });
    },
  });
};

