// pages/Comparison/ComparisonPage.jsx

import React, { useState } from 'react';
import {
  Card,
  Select,
  Button,
  Row,
  Col,
  DatePicker,
  Typography,
  Space,
  Tag,
  Empty,
  message,
} from 'antd';
import {
  BarChartOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Line } from 'recharts';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRateNames } from '../../hooks/useMarket';
import api from '../../services/api';
import moment from 'moment';
import './ComparisonPage.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Renk paleti
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

const ComparisonPage = () => {
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [dateRange, setDateRange] = useState([
    moment().subtract(1, 'month'),
    moment(),
  ]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Asset names
  const { data: goldNames } = useRateNames('gold');
  const { data: currencyNames } = useRateNames('currency');

  const goldOptions = goldNames?.data || [];
  const currencyOptions = currencyNames?.data || [];

  // Add asset
  const handleAddAsset = (value, option) => {
    if (selectedAssets.length >= 5) {
      message.warning('Maksimum 5 varlık seçebilirsiniz');
      return;
    }

    const asset = {
      type: option.type,
      name: value,
      color: COLORS[selectedAssets.length % COLORS.length],
    };

    setSelectedAssets([...selectedAssets, asset]);
  };

  // Remove asset
  const handleRemoveAsset = (name) => {
    setSelectedAssets(selectedAssets.filter((asset) => asset.name !== name));
  };

  // Fetch comparison data
  const handleCompare = async () => {
    if (selectedAssets.length < 2) {
      message.warning('En az 2 varlık seçmelisiniz');
      return;
    }

    try {
      setLoading(true);

      const params = {
        assets: selectedAssets.map((asset) => ({
          type: asset.type,
          name: asset.name,
        })),
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        normalize: true, // 100 bazlı normalize
      };

      const response = await api.post('/rates/comparison', params);

      if (response.success) {
        setChartData(response.data);
        message.success('Karşılaştırma başarılı!');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Karşılaştırma sırasında hata oluştu';
      message.error(errorMsg);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  // Format chart data
  const formattedChartData = chartData?.series.map((point) => {
    const dataPoint = { date: moment(point.date).format('DD.MM') };
    
    point.values.forEach((value) => {
      const asset = selectedAssets.find((a) => a.name === value.name && a.type === value.type);
      if (asset) {
        dataPoint[asset.name] = value.normalizedValue || 0;
      }
    });

    return dataPoint;
  }) || [];

  return (
    <div className="comparison-page">
      <Card className="comparison-header">
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined style={{ marginRight: 8 }} />
            Varlık Karşılaştırma
          </Title>
          <Text type="secondary">
            Farklı varlıkların performansını karşılaştırın (Maksimum 5 varlık)
          </Text>
        </Space>
      </Card>

      {/* Controls */}
      <Card title="Varlık Seçimi" className="comparison-controls">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Asset selector */}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={16}>
              <Select
                showSearch
                placeholder="Varlık seçin"
                style={{ width: '100%' }}
                onSelect={handleAddAsset}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                disabled={selectedAssets.length >= 5}
              >
                <Select.OptGroup label="Altın">
                  {goldOptions.map((name) => (
                    <Option key={`gold-${name}`} value={name} type="gold">
                      {name}
                    </Option>
                  ))}
                </Select.OptGroup>
                <Select.OptGroup label="Döviz">
                  {currencyOptions.map((name) => (
                    <Option key={`currency-${name}`} value={name} type="currency">
                      {name}
                    </Option>
                  ))}
                </Select.OptGroup>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Text type="secondary">
                {selectedAssets.length}/5 varlık seçildi
              </Text>
            </Col>
          </Row>

          {/* Selected assets */}
          {selectedAssets.length > 0 && (
            <div className="selected-assets">
              <Space wrap>
                {selectedAssets.map((asset) => (
                  <Tag
                    key={`${asset.type}-${asset.name}`}
                    color={asset.color}
                    closable
                    onClose={() => handleRemoveAsset(asset.name)}
                    icon={asset.type === 'gold' ? '🥇' : '💱'}
                  >
                    {asset.name}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          {/* Date range */}
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={16}>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD.MM.YYYY"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current > moment().endOf('day')}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={handleCompare}
                loading={loading}
                disabled={selectedAssets.length < 2}
                block
              >
                Karşılaştır
              </Button>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Chart */}
      <Card title="Normalize Edilmiş Performans (Başlangıç = 100)" className="comparison-chart-card">
        {formattedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={formattedChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value.toFixed(2)}`}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              {selectedAssets.map((asset) => (
                <Line
                  key={`${asset.type}-${asset.name}`}
                  type="monotone"
                  dataKey={asset.name}
                  stroke={asset.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Karşılaştırma yapmak için en az 2 varlık seçin ve 'Karşılaştır' butonuna tıklayın"
          />
        )}
      </Card>

      {/* Info */}
      {chartData && (
        <Card className="comparison-info">
          <Text type="secondary" style={{ fontSize: 12 }}>
            * Normalize edilmiş değerler, her varlığın başlangıç fiyatını 100 olarak kabul eder.
            <br />* Bu sayede farklı birimler ve fiyat aralıklarındaki varlıklar kolayca karşılaştırılabilir.
            <br />* Örneğin: 100 → 120 = %20 artış, 100 → 80 = %20 düşüş
          </Text>
        </Card>
      )}
    </div>
  );
};

export default ComparisonPage;

