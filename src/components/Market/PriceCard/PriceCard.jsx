// src/components/Market/PriceCard/PriceCard.jsx
import React from 'react';
import classNames from 'classnames';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import Sparkline from '../../Chart/Sparkline';
import { formatTL, formatPercent } from '../../../utils/formatters';
import './PriceCard.css';

/**
 * PriceCard Component
 * Piyasa sayfasında her bir varlık için gösterilen kart
 */
const PriceCard = ({
  name,
  type,
  buyPrice,
  sellPrice,
  previousPrice,
  sparklineData = [],
  isFavorite = false,
  onFavoriteToggle,
  onClick,
}) => {
  // Değişim hesaplama
  const priceChange = previousPrice ? sellPrice - previousPrice : 0;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Icon
  const typeIcon = type === 'gold' ? '🥇' : '💱';

  return (
    <div className="price-card" onClick={onClick}>
      {/* Header */}
      <div className="price-card-header">
        <div className="price-card-title">
          <span className="price-card-icon">{typeIcon}</span>
          <span className="price-card-name">{name}</span>
        </div>
        
        <button
          className="price-card-favorite"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle && onFavoriteToggle();
          }}
        >
          {isFavorite ? (
            <StarFilled style={{ color: '#faad14' }} />
          ) : (
            <StarOutlined style={{ color: 'var(--color-text-secondary)' }} />
          )}
        </button>
      </div>

      {/* Main price */}
      <div className="price-card-main-price">
        <div className="sell-price">{formatTL(sellPrice)}</div>
        <div className="buy-price">Alış: {formatTL(buyPrice)}</div>
      </div>

      {/* Change */}
      <div
        className={classNames('price-card-change', {
          positive: isPositive,
          negative: !isPositive,
        })}
      >
        <span className="change-value">
          {isPositive ? '+' : ''}
          {formatTL(priceChange)}
        </span>
        <span className="change-percent">
          ({isPositive ? '+' : ''}
          {formatPercent(priceChangePercent)})
        </span>
      </div>

      {/* Sparkline */}
      {sparklineData.length > 0 && (
        <div className="price-card-sparkline">
          <Sparkline
            data={sparklineData}
            color={isPositive ? 'var(--color-gain)' : 'var(--color-loss)'}
            height={40}
          />
        </div>
      )}

      {/* Footer info */}
      <div className="price-card-footer">
        <span className="price-card-type">{type === 'gold' ? 'Altın' : 'Döviz'}</span>
      </div>
    </div>
  );
};

export default PriceCard;

