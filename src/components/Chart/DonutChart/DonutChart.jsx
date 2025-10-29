// src/components/Chart/DonutChart/DonutChart.jsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './DonutChart.css';

/**
 * DonutChart Component
 * Dağılım grafiği için donut chart
 */
const DonutChart = ({ data = [], colors = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="donut-chart-empty">
        <p>Görüntülenecek veri yok</p>
      </div>
    );
  }

  const COLORS = colors.length > 0
    ? colors
    : ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="donut-tooltip">
          <p className="tooltip-label">{data.name}</p>
          <p className="tooltip-value">
            {data.value.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            })}
          </p>
          <p className="tooltip-percent">{data.payload.percent}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <ul className="donut-legend">
        {payload.map((entry, index) => (
          <li key={`legend-${index}`} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: entry.color }}
            />
            <span className="legend-label">{entry.value}</span>
            <span className="legend-value">{entry.payload.percent}%</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="donut-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;

