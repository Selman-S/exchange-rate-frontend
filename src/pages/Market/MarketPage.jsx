// src/pages/Market/MarketPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { message } from 'antd';
import MarketFilters from '../../components/Market/MarketFilters';
import PriceGrid from '../../components/Market/PriceGrid';
import MarketDetailDrawer from '../../components/Market/MarketDetailDrawer/MarketDetailDrawer';
import { useLatestRates } from '../../hooks/useMarket';
import { useFavorites, useAddFavorite, useDeleteFavorite, useAutoMigrateFavorites } from '../../hooks/useFavorites';
import './MarketPage.css';

/**
 * MarketPage Component
 * Ana piyasa sayfası - fiyat listesi, filtreler
 */
const MarketPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Backend'den favoriler
  const { data: favoritesData } = useFavorites();
  const addFavoriteMutation = useAddFavorite();
  const deleteFavoriteMutation = useDeleteFavorite();
  
  // Auto-migration on mount
  const { checkAndMigrate } = useAutoMigrateFavorites();
  
  useEffect(() => {
    checkAndMigrate();
  }, []);
  
  // Backend'den gelen favorileri map'le
  const favorites = useMemo(() => {
    if (!favoritesData?.data) return [];
    return favoritesData.data.map(fav => `${fav.assetType}-${fav.assetName}`);
  }, [favoritesData]);

  // API'den verileri çek
  const { data, isLoading, error } = useLatestRates(
    typeFilter === 'all' ? undefined : typeFilter
  );

  // Error handling
  if (error) {
    message.error('Veriler yüklenirken hata oluştu: ' + error);
  }

  // Veriyi işle ve filtrele
  const processedRates = useMemo(() => {
    if (!data || !data.data) return [];

    let rates = data.data;

    // Arama filtresi
    if (searchTerm) {
      rates = rates.filter((rate) =>
        rate.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Favoriler filtresi
    if (showFavorites) {
      rates = rates.filter((rate) =>
        favorites.includes(`${rate.type}-${rate.name}`)
      );
    }

    // Sıralama
    rates = [...rates].sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name, 'tr');
        case 'name-desc':
          return b.name.localeCompare(a.name, 'tr');
        case 'price-high':
          return b.sellPrice - a.sellPrice;
        case 'price-low':
          return a.sellPrice - b.sellPrice;
        case 'change-high':
          // TODO: Değişim verisi eklendiğinde implement edilecek
          return 0;
        case 'change-low':
          return 0;
        default:
          return 0;
      }
    });

    return rates;
  }, [data, searchTerm, showFavorites, sortBy, favorites]);

  // Favori toggle - Backend ile senkronize
  const handleFavoriteToggle = (type, name) => {
    const key = `${type}-${name}`;
    
    if (favorites.includes(key)) {
      // Favoriyi sil
      const favoriteItem = favoritesData?.data?.find(
        fav => fav.assetType === type && fav.assetName === name
      );
      
      if (favoriteItem) {
        deleteFavoriteMutation.mutate(favoriteItem._id);
      }
    } else {
      // Favori ekle
      addFavoriteMutation.mutate({ assetType: type, assetName: name });
    }
  };

  // Filtreleri sıfırla
  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setSortBy('name-asc');
    setShowFavorites(false);
  };

  // Kart tıklama
  const handleCardClick = (rate) => {
    setSelectedAsset(rate);
    setDrawerOpen(true);
  };

  // Drawer kapatma
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedAsset(null), 300); // Animation için bekle
  };

  // Drawer'dan favori toggle
  const handleDrawerFavoriteToggle = () => {
    if (selectedAsset) {
      handleFavoriteToggle(selectedAsset);
    }
  };

  // Drawer'dan alarm oluştur
  const handleCreateAlertFromDrawer = () => {
    message.info('Alarm oluşturma sayfasına yönlendiriliyorsunuz...');
    // TODO: Alarm modal aç veya alarm sayfasına yönlendir
    // window.location.href = '/alerts';
  };

  return (
    <div className="market-page">
      {/* Page header */}
      <div className="market-page-header">
        <h1 className="market-page-title">Piyasa</h1>
        <p className="market-page-subtitle">
          Anlık altın ve döviz kurları
        </p>
      </div>

      {/* Filters */}
      <MarketFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showFavorites={showFavorites}
        onToggleFavorites={() => setShowFavorites(!showFavorites)}
        onReset={handleResetFilters}
      />

      {/* Results count */}
      {!isLoading && (
        <div className="market-results-count">
          {processedRates.length} varlık gösteriliyor
        </div>
      )}

      {/* Grid */}
      <PriceGrid
        rates={processedRates}
        loading={isLoading}
        favorites={favorites}
        onFavoriteToggle={handleFavoriteToggle}
        onCardClick={handleCardClick}
        emptyMessage={
          showFavorites
            ? 'Henüz favori eklenmemiş'
            : searchTerm
            ? 'Arama sonucu bulunamadı'
            : 'Varlık bulunamadı'
        }
      />

      {/* Detail Drawer */}
      {selectedAsset && (
        <MarketDetailDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          assetType={selectedAsset.type}
          assetName={selectedAsset.name}
          currentPrice={selectedAsset.sellPrice}
          isFavorite={favorites.includes(`${selectedAsset.type}-${selectedAsset.name}`)}
          onFavoriteToggle={handleDrawerFavoriteToggle}
          onCreateAlert={handleCreateAlertFromDrawer}
        />
      )}
    </div>
  );
};

export default MarketPage;

