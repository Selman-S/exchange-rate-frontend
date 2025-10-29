// src/components/Portfolio/PortfolioSummaryCard/PortfolioSummaryCard.jsx
import React from 'react';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { Card, Loading } from '../../Common';
import { formatTL, formatPercent } from '../../../utils/formatters';
import './PortfolioSummaryCard.css';

/**
 * PortfolioSummaryCard Component
 * Portföy özet kartı - toplam değer, PNL gösterimi
 */
const PortfolioSummaryCard = ({ summary, loading = false }) => {
  if (loading || !summary) {
    return (
      <Card className="portfolio-summary-card">
        <Loading size="md" text="Özet yükleniyor..." />
      </Card>
    );
  }

  const isProfitable = summary.pnl >= 0;

  return (
    <Card className="portfolio-summary-card">
      <div className="summary-grid">
        {/* Toplam Değer */}
        <div className="summary-item summary-main">
          <div className="summary-label">Toplam Değer</div>
          <div className="summary-value">{formatTL(summary.totalValue)}</div>
        </div>

        {/* Maliyet */}
        <div className="summary-item">
          <div className="summary-label">Maliyet</div>
          <div className="summary-value-secondary">{formatTL(summary.totalCost)}</div>
        </div>

        {/* Kar/Zarar */}
        <div className="summary-item">
          <div className="summary-label">Kar/Zarar</div>
          <div
            className={classNames('summary-pnl', {
              positive: isProfitable,
              negative: !isProfitable,
            })}
          >
            {isProfitable ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span>{formatTL(Math.abs(summary.pnl))}</span>
          </div>
        </div>

        {/* Getiri */}
        <div className="summary-item">
          <div className="summary-label">Getiri</div>
          <div
            className={classNames('summary-pnl', {
              positive: isProfitable,
              negative: !isProfitable,
            })}
          >
            {formatPercent(summary.pnlPercent, 2, true)}
          </div>
        </div>

        {/* Varlık Sayısı */}
        <div className="summary-item">
          <div className="summary-label">Varlık Sayısı</div>
          <div className="summary-value-secondary">{summary.assetCount}</div>
        </div>
      </div>
    </Card>
  );
};

export default PortfolioSummaryCard;

