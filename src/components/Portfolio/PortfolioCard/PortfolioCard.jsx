// src/components/Portfolio/PortfolioCard/PortfolioCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Modal, message } from 'antd';
import {
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import { Card, Loading } from '../../Common';
import { formatTL, formatPercent } from '../../../utils/formatters';
import './PortfolioCard.css';

/**
 * PortfolioCard Component
 * Portföy listesinde gösterilen kart
 */
const PortfolioCard = ({
  portfolio,
  summary,
  loading = false,
  onEdit,
  onDelete,
}) => {
  const handleDelete = () => {
    Modal.confirm({
      title: 'Portföyü Sil',
      content: `"${portfolio.name}" portföyünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await onDelete(portfolio._id);
          message.success('Portföy silindi');
        } catch (error) {
          message.error('Portföy silinirken hata oluştu');
        }
      },
    });
  };

  const menuItems = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Düzenle',
      onClick: () => onEdit(portfolio),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Sil',
      danger: true,
      onClick: handleDelete,
    },
  ];

  if (loading || !summary) {
    return (
      <Card className="portfolio-card">
        <Loading size="md" text="Yükleniyor..." />
      </Card>
    );
  }

  const isProfitable = summary.pnl >= 0;

  return (
    <Link to={`/portfolio/${portfolio._id}`} className="portfolio-card-link">
      <Card hoverable className="portfolio-card">
        {/* Header */}
        <div className="portfolio-card-header">
          <div className="portfolio-card-title">
            <FolderOpenOutlined className="portfolio-icon" />
            <span className="portfolio-name">{portfolio.name}</span>
          </div>
          
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <button
              className="portfolio-card-menu"
              onClick={(e) => e.preventDefault()}
            >
              <MoreOutlined />
            </button>
          </Dropdown>
        </div>

        {/* Main value */}
        <div className="portfolio-card-value">
          <div className="total-value">{formatTL(summary.totalValue)}</div>
          <div className="total-cost-label">Maliyet: {formatTL(summary.totalCost)}</div>
        </div>

        {/* PNL */}
        <div
          className={classNames('portfolio-card-pnl', {
            positive: isProfitable,
            negative: !isProfitable,
          })}
        >
          {isProfitable ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span className="pnl-value">{formatTL(Math.abs(summary.pnl))}</span>
          <span className="pnl-percent">
            ({isProfitable ? '+' : '-'}
            {formatPercent(Math.abs(summary.pnlPercent))})
          </span>
        </div>

        {/* Footer */}
        <div className="portfolio-card-footer">
          <div className="asset-count">
            {summary.assetCount} varlık
          </div>
          <div className="portfolio-card-action">
            Detaylar →
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default PortfolioCard;

