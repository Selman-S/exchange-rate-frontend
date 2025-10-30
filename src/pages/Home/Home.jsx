// pages/Home/Home.jsx

import React, { useState, useMemo } from 'react';
import { Typography, Card, Table, Tabs, DatePicker, Row, Col, Statistic, Tag, Space } from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  GoldOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useHourlyRates, useLatestRates } from '../../hooks/useMarket';
import { formatTL, formatPercent } from '../../utils/formatters';
import moment from 'moment';
import './Home.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Home = () => {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [activeView, setActiveView] = useState('today'); // 'today' | 'historical'
  
  const isToday = selectedDate.isSame(moment(), 'day');
  
  // Bugünün saatlik verileri
  const { data: hourlyData, isLoading: hourlyLoading } = useHourlyRates(
    selectedDate.format('YYYY-MM-DD'),
    { enabled: activeView === 'today' }
  );
  
  // Latest rates (tarihsel görünüm için)
  const { data: latestData, isLoading: latestLoading } = useLatestRates(
    undefined,
    { enabled: activeView === 'historical' }
  );

  // Saatlik veriler için mevcut saat seçimi
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  
  // Mevcut saatlik veri
  const currentHourData = useMemo(() => {
    if (!hourlyData?.data?.hourlyRates) return null;
    
    const hourData = hourlyData.data.hourlyRates.find(h => h.hour === selectedHour);
    return hourData || hourlyData.data.hourlyRates[hourlyData.data.hourlyRates.length - 1];
  }, [hourlyData, selectedHour]);

  // Saat tabs
  const availableHours = useMemo(() => {
    if (!hourlyData?.data?.hourlyRates) return [];
    return hourlyData.data.hourlyRates.map(h => h.hour).sort((a, b) => a - b);
  }, [hourlyData]);

  // Tablo sütunları
  const columns = [
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'gold' ? 'gold' : 'blue'} icon={type === 'gold' ? <GoldOutlined /> : <DollarOutlined />}>
          {type === 'gold' ? 'Altın' : 'Döviz'}
        </Tag>
      ),
      filters: [
        { text: 'Altın', value: 'gold' },
        { text: 'Döviz', value: 'currency' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Varlık',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name, 'tr'),
    },
    {
      title: 'Alış Fiyatı',
      dataIndex: 'buyPrice',
      key: 'buyPrice',
      align: 'right',
      render: (price) => formatTL(price),
      sorter: (a, b) => a.buyPrice - b.buyPrice,
    },
    {
      title: 'Satış Fiyatı',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      align: 'right',
      render: (price) => <Text strong>{formatTL(price)}</Text>,
      sorter: (a, b) => a.sellPrice - b.sellPrice,
    },
  ];

  // Stats cards için özet veriler
  const stats = useMemo(() => {
    const rates = activeView === 'today' ? currentHourData?.rates : latestData?.data;
    
    if (!rates) return { goldCount: 0, currencyCount: 0 };
    
    return {
      goldCount: rates.filter(r => r.type === 'gold').length,
      currencyCount: rates.filter(r => r.type === 'currency').length,
    };
  }, [currentHourData, latestData, activeView]);

  const tableData = activeView === 'today' 
    ? currentHourData?.rates || [] 
    : latestData?.data || [];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="home-hero">
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0 }}>
            <ClockCircleOutlined style={{ marginRight: 8 }} />
            Güncel Altın ve Döviz Kurları
          </Title>
          <Text type="secondary">
            {isToday ? 'Bugünün saatlik verileri' : `${selectedDate.format('DD MMMM YYYY')} tarihli veriler`}
          </Text>
        </Space>
      </div>

      {/* View Toggle */}
      <Card className="view-toggle-card">
        <Tabs activeKey={activeView} onChange={setActiveView}>
          <TabPane tab="📅 Bugün (Saatlik)" key="today" />
          <TabPane tab="📊 Geçmiş Günler" key="historical" />
        </Tabs>
      </Card>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Altın Fiyatları"
              value={stats.goldCount}
              prefix={<GoldOutlined />}
              suffix="varlık"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Döviz Kurları"
              value={stats.currencyCount}
              prefix={<DollarOutlined />}
              suffix="para birimi"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Toplam Varlık"
              value={stats.goldCount + stats.currencyCount}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bugünün Saatlik Verileri */}
      {activeView === 'today' && (
        <>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                <span>Saat Seçimi</span>
              </Space>
            }
            className="hour-selector-card"
          >
            <Tabs 
              activeKey={selectedHour.toString()} 
              onChange={(key) => setSelectedHour(parseInt(key))}
              type="card"
            >
              {availableHours.map(hour => (
                <TabPane 
                  tab={`${hour.toString().padStart(2, '0')}:00`} 
                  key={hour.toString()}
                />
              ))}
            </Tabs>
            
            {availableHours.length === 0 && !hourlyLoading && (
              <Text type="secondary">Bugün için henüz saatlik veri yok</Text>
            )}
          </Card>

          <Card 
            title={`${selectedHour.toString().padStart(2, '0')}:00 Fiyatları`}
            className="rates-table-card"
          >
            <Table
              dataSource={tableData}
              columns={columns}
              rowKey="_id"
              loading={hourlyLoading}
              pagination={{ pageSize: 15, showSizeChanger: true }}
              scroll={{ x: 600 }}
            />
          </Card>
        </>
      )}

      {/* Geçmiş Günler */}
      {activeView === 'historical' && (
        <>
          <Card 
            title="Tarih Seçimi"
            className="date-selector-card"
          >
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              disabledDate={(current) => current && current > moment().endOf('day')}
              format="DD MMMM YYYY"
              style={{ width: '100%' }}
            />
          </Card>

          <Card 
            title={`${selectedDate.format('DD MMMM YYYY')} Fiyatları`}
            className="rates-table-card"
          >
            <Table
              dataSource={tableData}
              columns={columns}
              rowKey="_id"
              loading={latestLoading}
              pagination={{ pageSize: 15, showSizeChanger: true }}
              scroll={{ x: 600 }}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default Home;

