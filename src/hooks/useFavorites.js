// hooks/useFavorites.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import {
  fetchFavorites,
  addFavorite,
  deleteFavorite,
  reorderFavorites,
  migrateFavorites,
} from '../services/favoriteApi';

/**
 * Favorileri getirir
 */
export const useFavorites = () => {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: 2,
  });
};

/**
 * Favori ekler
 */
export const useAddFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assetType, assetName }) => addFavorite(assetType, assetName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      message.success('Favorilere eklendi');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Favori eklenirken hata oluştu';
      message.error(errorMsg);
    },
  });
};

/**
 * Favori siler
 */
export const useDeleteFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favoriteId) => deleteFavorite(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      message.success('Favorilerden çıkarıldı');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Favori silinirken hata oluştu';
      message.error(errorMsg);
    },
  });
};

/**
 * Favorileri yeniden sıralar
 */
export const useReorderFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favorites) => reorderFavorites(favorites),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      message.success('Sıralama güncellendi');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Sıralama güncellenirken hata oluştu';
      message.error(errorMsg);
    },
  });
};

/**
 * LocalStorage'dan favorileri migrate eder
 */
export const useMigrateFavorites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favorites) => migrateFavorites(favorites),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      message.success(data.message || 'Favoriler başarıyla aktarıldı');
    },
    onError: (error) => {
      const errorMsg = error.response?.data?.error || 'Migration sırasında hata oluştu';
      
      // If user already has favorites, just clear localStorage and don't show error
      if (error.response?.status === 409) {
        localStorage.removeItem('favorites');
        return;
      }
      
      message.error(errorMsg);
    },
  });
};

/**
 * LocalStorage'daki favorileri kontrol eder ve backend'e yoksa migrate eder
 */
export const useAutoMigrateFavorites = () => {
  const { data: favoritesData, isLoading } = useFavorites();
  const migrateMutation = useMigrateFavorites();

  const checkAndMigrate = () => {
    // Skip if still loading or already has backend favorites
    if (isLoading || (favoritesData?.data && favoritesData.data.length > 0)) {
      return;
    }

    // Check localStorage
    const localFavorites = localStorage.getItem('favorites');
    if (localFavorites) {
      try {
        const parsedFavorites = JSON.parse(localFavorites);
        if (Array.isArray(parsedFavorites) && parsedFavorites.length > 0) {
          // Trigger migration
          migrateMutation.mutate(parsedFavorites);
        }
      } catch (err) {
        console.error('Error parsing localStorage favorites:', err);
      }
    }
  };

  return {
    checkAndMigrate,
    isMigrating: migrateMutation.isPending,
  };
};

