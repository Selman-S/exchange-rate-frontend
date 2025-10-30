// src/components/Market/MarketDetailDrawer/MarketDetailDrawer.jsx

import React, { useState, useMemo } from 'react';
import {
  Drawer,
  Statistic,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Button,
  Segmented,
  message,
} from 'antd';
import {
  StarOutlined,
  StarFilled,
  BellOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRateSeries } from '../../../hooks/useMarket';
import { formatTL } from '../../../utils/formatters';
import moment from 'moment';
import './MarketDetailDrawer.css';

const { Title, Text } = Typography;

const MarketDetailDrawer = ({
  open,
  onClose,
  assetType,
  assetName,
  currentPrice,
  isFavorite,
  onFavoriteToggle,
  onCreateAlert,
}) => {
  const [timeRange, setTimeRange] = useState('1M');

  // Time range options
  const timeRangeOptions = [
    { label: '1H', value: '1W' },
    { label: '1A', value: '1M' },
    { label: '3A', value: '3M' },
    { label: '6A', value: '6M' },
    { label: '1Y', value: '1Y' },
    { label: 'Maks', value: 'ALL' },
  ];

  // Calculate date range
  const getDateRange = () => {
    const endDate = moment();
    let startDate = moment();

    switch (timeRange) {
      case '1W':
        startDate = moment().subtract(1, 'week');
        break;
      case '1M':
        startDate = moment().subtract(1, 'month');
        break;
      case '3M':
        startDate = moment().subtract(3, 'months');
        break;
      case '6M':
        startDate = moment().subtract(6, 'months');
        break;
      case '1Y':
        startDate = moment().subtract(1, 'year');
        break;
      case 'ALL':
        startDate = moment().subtract(3, 'years');
        break;
      default:
        startDate = moment().subtract(1, 'month');
    }

    return {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
    };
  };

  // Fetch historical data
  const { startDate, endDate } = getDateRange();
  const { data: seriesData, isLoading } = useRateSeries(
    {
      type: assetType,
      name: assetName,
      startDate,
      endDate,
    },
    { enabled: open && !!assetName }
  );

  const rates = seriesData?.data || [];

  // Chart data
  const chartData = useMemo(() => {
    return rates.map((rate) => ({
      date: moment(rate.date).format('DD.MM'),
      price: rate.sellPrice,
      buyPrice: rate.buyPrice,
    }));
  }, [rates]);

  // Statistics
  const stats = useMemo(() => {
    if (rates.length === 0) {
      return {
        high: 0,
        low: 0,
        avg: 0,
        change: 0,
        changePercent: 0,
      };
    }

    const prices = rates.map((r) => r.sellPrice);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;

    const firstPrice = rates[0]?.sellPrice || 0;
    const lastPrice = rates[rates.length - 1]?.sellPrice || 0;
    const change = lastPrice - firstPrice;
    const changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0;

    return {
      high,
      low,
      avg,
      change,
      changePercent,
      isPositive: change >= 0,
    };
  }, [rates]);

  return (
    <Drawer
      title={
        <Space>
          <span>{assetType === 'gold' ? '🥇' : '💱'}</span>
          <span>{assetName}</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={720}
      className="market-detail-drawer"
      extra={
        <Space>
          <Button
            icon={isFavorite ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle && onFavoriteToggle();
            }}
          >
            {isFavorite ? 'Favoriden Çıkar' : 'Favorilere Ekle'}
          </Button>
          <Button
            type="primary"
            icon={<BellOutlined />}
            onClick={() => onCreateAlert && onCreateAlert()}
          >
            Alarm Oluştur
          </Button>
        </Space>
      }
    >
      {/* Current Price */}
      <div className="drawer-current-price">
        <Statistic
          title="Güncel Fiyat"
          value={currentPrice}
          prefix="₺"
          precision={2}
          valueStyle={{ fontSize: 32 }}
        />
      </div>

      <Divider />

      {/* Time Range Selector */}
      <div className="drawer-time-range">
        <Segmented
          options={timeRangeOptions}
          value={timeRange}
          onChange={setTimeRange}
          block
        />
      </div>

      {/* Chart */}
      <div className="drawer-chart">
        {isLoading ? (
          <div className="chart-loading">Yükleniyor...</div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip
                formatter={(value) => [formatTL(value), 'Fiyat']}
                labelStyle={{ color: '#000' }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={stats.isPositive ? '#52c41a' : '#ff4d4f'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">Bu dönem için veri bulunamadı</div>
        )}
      </div>

      <Divider />

      {/* Statistics */}
      <div className="drawer-statistics">
        <Title level={5}>İstatistikler ({timeRangeOptions.find((o) => o.value === timeRange)?.label})</Title>

        <Row gutter={[16, 16]}>
          <Col xs={12} sm={8}>
            <Statistic
              title="En Yüksek"
              value={stats.high}
              prefix={<RiseOutlined />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
              suffix="₺"
            />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="En Düşük"
              value={stats.low}
              prefix={<FallOutlined />}
              precision={2}
              valueStyle={{ color: '#ff4d4f' }}
              suffix="₺"
            />
          </Col>
          <Col xs={12} sm={8}>
            <Statistic
              title="Ortalama"
              value={stats.avg}
              precision={2}
              suffix="₺"
            />
          </Col>
          <Col xs={12} sm={12}>
            <Statistic
              title="Değişim"
              value={stats.change}
              prefix={stats.isPositive ? '+' : ''}
              precision={2}
              valueStyle={{ color: stats.isPositive ? '#52c41a' : '#ff4d4f' }}
              suffix="₺"
            />
          </Col>
          <Col xs={12} sm={12}>
            <Statistic
              title="Değişim %"
              value={stats.changePercent}
              prefix={stats.isPositive ? '+' : ''}
              precision={2}
              valueStyle={{ color: stats.isPositive ? '#52c41a' : '#ff4d4f' }}
              suffix="%"
            />
          </Col>
        </Row>
      </div>

      <Divider />

      {/* Info */}
      <div className="drawer-info">
        <Text type="secondary" style={{ fontSize: 12 }}>
          * Fiyatlar satış fiyatları üzerinden gösterilmektedir.
          <br />* İstatistikler seçilen zaman aralığına göredir.
        </Text>
      </div>
    </Drawer>
  );
};

export default MarketDetailDrawer;

