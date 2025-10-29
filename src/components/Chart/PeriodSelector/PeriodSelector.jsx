// src/components/Chart/PeriodSelector/PeriodSelector.jsx
import React from 'react';
import { Button } from 'antd';
import './PeriodSelector.css';

/**
 * PeriodSelector Component
 * Zaman aralığı seçici buton grubu
 */
const PERIODS = [
  { value: '1W', label: '1H' },
  { value: '1M', label: '1A' },
  { value: '3M', label: '3A' },
  { value: '6M', label: '6A' },
  { value: '1Y', label: '1Y' },
  { value: '3Y', label: '3Y' },
  { value: 'ALL', label: 'Maks' },
];

const PeriodSelector = ({ value = '6M', onChange }) => {
  return (
    <div className="period-selector">
      <Button.Group>
        {PERIODS.map((period) => (
          <Button
            key={period.value}
            type={value === period.value ? 'primary' : 'default'}
            onClick={() => onChange(period.value)}
            size="small"
          >
            {period.label}
          </Button>
        ))}
      </Button.Group>
    </div>
  );
};

export default PeriodSelector;

