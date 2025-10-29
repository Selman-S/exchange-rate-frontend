// src/components/Market/MarketFilters/MarketFilters.jsx
import React from 'react';
import { Input, Select, Radio, Button } from 'antd';
import { SearchOutlined, FilterOutlined, StarFilled } from '@ant-design/icons';
import './MarketFilters.css';

const { Option } = Select;

/**
 * MarketFilters Component
 * Piyasa sayfası filtreleme ve arama
 */
const MarketFilters = ({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  sortBy,
  onSortChange,
  showFavorites,
  onToggleFavorites,
  onReset,
}) => {
  return (
    <div className="market-filters">
      {/* Search */}
      <div className="filter-search">
        <Input
          size="large"
          placeholder="Varlık ara..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
        />
      </div>

      {/* Type filter */}
      <div className="filter-type">
        <Radio.Group
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          buttonStyle="solid"
          size="large"
        >
          <Radio.Button value="all">Hepsi</Radio.Button>
          <Radio.Button value="gold">Altın</Radio.Button>
          <Radio.Button value="currency">Döviz</Radio.Button>
        </Radio.Group>
      </div>

      {/* Sort */}
      <div className="filter-sort">
        <Select
          value={sortBy}
          onChange={onSortChange}
          size="large"
          style={{ width: 200 }}
          suffixIcon={<FilterOutlined />}
        >
          <Option value="name-asc">İsim (A-Z)</Option>
          <Option value="name-desc">İsim (Z-A)</Option>
          <Option value="price-high">Fiyat (Yüksek)</Option>
          <Option value="price-low">Fiyat (Düşük)</Option>
          <Option value="change-high">Değişim (+)</Option>
          <Option value="change-low">Değişim (-)</Option>
        </Select>
      </div>

      {/* Favorites toggle */}
      <div className="filter-favorites">
        <Button
          size="large"
          type={showFavorites ? 'primary' : 'default'}
          icon={<StarFilled />}
          onClick={onToggleFavorites}
        >
          Favoriler
        </Button>
      </div>

      {/* Reset */}
      <div className="filter-reset">
        <Button size="large" onClick={onReset}>
          Sıfırla
        </Button>
      </div>
    </div>
  );
};

export default MarketFilters;

