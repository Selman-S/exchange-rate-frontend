// hooks/useAlerts.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  fetchAlerts,
  fetchActiveAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  toggleAlert,
} from '../services/alertApi';

/**
 * Kullanıcının alarmlarını getirir
 */
export const useAlerts = (status, options = {}) => {
  return useQuery({
    queryKey: ['alerts', status],
    queryFn: () => fetchAlerts(status),
    staleTime: 2 * 60 * 1000, // 2 dakika
    refetchInterval: 5 * 60 * 1000, // 5 dakikada bir otomatik refresh
    ...options,
  });
};

/**
 * Aktif alarmları getirir
 */
export const useActiveAlerts = (options = {}) => {
  return useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: fetchActiveAlerts,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
};

/**
 * Yeni alarm oluşturur
 */
export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      message.success('Alarm başarıyla oluşturuldu');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Alarm oluşturulurken hata oluştu';
      message.error(errorMsg);
    },
  });
};

/**
 * Alarm günceller
 */
export const useUpdateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, data }) => updateAlert(alertId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      message.success('Alarm güncellendi');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Alarm güncellenirken hata oluştu';
      message.error(errorMsg);
    },
  });
};

/**
 * Alarm siler
 */
export const useDeleteAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId) => deleteAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      message.success('Alarm silindi');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Alarm silinirken hata oluştu';
      message.error(errorMsg);
    },
  });
};

/**
 * Alarm durumunu toggle eder
 */
export const useToggleAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId) => toggleAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      message.success('Alarm durumu güncellendi');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Alarm durumu güncellenirken hata oluştu';
      message.error(errorMsg);
    },
  });
};
