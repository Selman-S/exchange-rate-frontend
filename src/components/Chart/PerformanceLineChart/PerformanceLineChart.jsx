// src/components/Chart/PerformanceLineChart/PerformanceLineChart.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatTL } from '../../../utils/formatters';
import './PerformanceLineChart.css';

/**
 * PerformanceLineChart Component
 * Portföy değerinin zaman içindeki değişimini gösteren line chart
 */
const PerformanceLineChart = ({ data = [], loading = false }) => {
  if (loading) {
    return (
      <div className="performance-line-chart-loading">
        <p>Grafik yükleniyor...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="performance-line-chart-empty">
        <p>Görüntülenecek veri yok</p>
        <p className="empty-description">
          Portföyünüze varlık ekledikçe ve zaman geçtikçe performans grafiği oluşacak
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="performance-tooltip">
          <p className="tooltip-date">{label}</p>
          <p className="tooltip-value">
            Değer: {formatTL(data.value)}
          </p>
          {data.payload.change !== undefined && (
            <p
              className="tooltip-change"
              style={{
                color: data.payload.change >= 0 ? 'var(--color-gain)' : 'var(--color-loss)',
              }}
            >
              Değişim: {data.payload.change >= 0 ? '+' : ''}
              {data.payload.change.toFixed(2)}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="performance-line-chart-container">
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            stroke="var(--color-text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="var(--color-text-secondary)"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="Portföy Değeri"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={{ fill: 'var(--color-primary)', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceLineChart;

