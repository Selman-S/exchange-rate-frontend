// src/pages/Market/MarketPage.jsx
import React, { useState, useMemo } from 'react';
import { message } from 'antd';
import MarketFilters from '../../components/Market/MarketFilters';
import PriceGrid from '../../components/Market/PriceGrid';
import { useLatestRates } from '../../hooks/useMarket';
import { useLocalStorage } from '../../hooks';
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
  const [favorites, setFavorites] = useLocalStorage('market-favorites', []);

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

  // Favori toggle
  const handleFavoriteToggle = (type, name) => {
    const key = `${type}-${name}`;
    if (favorites.includes(key)) {
      setFavorites(favorites.filter((fav) => fav !== key));
      message.success('Favorilerden çıkarıldı');
    } else {
      setFavorites([...favorites, key]);
      message.success('Favorilere eklendi');
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
    console.log('Card clicked:', rate);
    // TODO: Detay drawer açılacak
    message.info('Detay sayfası yakında eklenecek');
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
    </div>
  );
};

export default MarketPage;

