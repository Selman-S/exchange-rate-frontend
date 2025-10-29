// src/components/Chart/Sparkline/Sparkline.jsx
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import './Sparkline.css';

/**
 * Sparkline Component - Mini line chart
 * @param {Array} data - Veri dizisi [{date, value}]
 * @param {string} color - Çizgi rengi
 * @param {number} height - Yükseklik (px)
 */
const Sparkline = ({ data = [], color = '#1890ff', height = 40 }) => {
  if (!data || data.length === 0) {
    return <div className="sparkline-empty" style={{ height }} />;
  }

  // Veriyi Recharts formatına dönüştür
  const chartData = data.map((item) => ({
    value: item.sellPrice || item.buyPrice || item.value || 0,
  }));

  // Trend yönünü belirle (artış/azalış)
  const firstValue = chartData[0]?.value || 0;
  const lastValue = chartData[chartData.length - 1]?.value || 0;
  const isPositive = lastValue >= firstValue;

  return (
    <div className="sparkline-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color || (isPositive ? 'var(--color-gain)' : 'var(--color-loss)')}
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;

