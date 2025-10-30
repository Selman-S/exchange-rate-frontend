// src/components/Market/PriceCard/PriceCard.jsx
import React, { useState } from 'react';
import classNames from 'classnames';
import { StarOutlined, StarFilled } from '@ant-design/icons';
import { Segmented } from 'antd';
import Sparkline from '../../Chart/Sparkline';
import { formatTL, formatPercent } from '../../../utils/formatters';
import { usePriceChange } from '../../../hooks/useMarket';
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
  sparklineData = [],
  isFavorite = false,
  onFavoriteToggle,
  onClick,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  // Period options
  const periodOptions = [
    { label: '1G', value: 'daily' },
    { label: '1H', value: 'weekly' },
    { label: '1A', value: 'monthly' },
    { label: '1Y', value: 'yearly' },
  ];

  // Fetch price change for selected period
  const { data: changeData, isLoading: changeLoading } = usePriceChange({
    type,
    name,
    period: selectedPeriod,
  });

  const priceChange = changeData?.data?.change || 0;
  const priceChangePercent = changeData?.data?.changePercent || 0;
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

      {/* Period Selector */}
      <div className="price-card-period" onClick={(e) => e.stopPropagation()}>
        <Segmented
          options={periodOptions}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          size="small"
        />
      </div>

      {/* Change */}
      {changeLoading ? (
        <div className="price-card-change loading">Yükleniyor...</div>
      ) : (
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
      )}

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
