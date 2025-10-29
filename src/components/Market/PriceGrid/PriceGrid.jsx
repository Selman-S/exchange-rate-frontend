// src/components/Market/PriceGrid/PriceGrid.jsx
import React from 'react';
import PriceCard from '../PriceCard';
import { Loading, EmptyState } from '../../Common';
import './PriceGrid.css';

/**
 * PriceGrid Component
 * Price card'ları grid düzeninde gösterir
 */
const PriceGrid = ({
  rates = [],
  loading = false,
  favorites = [],
  onFavoriteToggle,
  onCardClick,
  emptyMessage = 'Varlık bulunamadı',
}) => {
  if (loading) {
    return (
      <div className="price-grid-loading">
        <Loading size="lg" text="Yükleniyor..." />
      </div>
    );
  }

  if (!rates || rates.length === 0) {
    return (
      <EmptyState
        icon="📊"
        title={emptyMessage}
        description="Farklı filtreler deneyebilir veya arama yapabilirsiniz."
      />
    );
  }

  return (
    <div className="price-grid">
      {rates.map((rate) => (
        <PriceCard
          key={`${rate.type}-${rate.name}`}
          name={rate.name}
          type={rate.type}
          buyPrice={rate.buyPrice}
          sellPrice={rate.sellPrice}
          previousPrice={rate.previousPrice}
          sparklineData={rate.sparklineData}
          isFavorite={favorites.includes(`${rate.type}-${rate.name}`)}
          onFavoriteToggle={() => onFavoriteToggle(rate.type, rate.name)}
          onClick={() => onCardClick && onCardClick(rate)}
        />
      ))}
    </div>
  );
};

export default PriceGrid;

