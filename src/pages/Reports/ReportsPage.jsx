import React, { useState, useMemo } from 'react';
import { Card, DatePicker, Select, Row, Col, Statistic, Table, Empty, Button, Dropdown, Space } from 'antd';
import {
  TrophyOutlined,
  FallOutlined,
  RiseOutlined,
  LineChartOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { usePortfolios, usePortfolioValueSeries } from '../../hooks/usePortfolio';
import { useLatestRates } from '../../hooks/useMarket';
import { PerformanceLineChart } from '../../components/Chart';
import { formatTL, formatPercent, formatDate } from '../../utils/formatters';
import './ReportsPage.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage = () => {
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);

  const { data: portfoliosData, isLoading: portfoliosLoading } = usePortfolios();
  const portfolios = portfoliosData?.data || [];

  // Portfolio value series
  const { data: valueSeriesData, isLoading: seriesLoading } = usePortfolioValueSeries(
    selectedPortfolio,
    'CUSTOM',
    {
      startDate: dateRange[0]?.format('YYYY-MM-DD'),
      endDate: dateRange[1]?.format('YYYY-MM-DD'),
    },
    { enabled: !!selectedPortfolio }
  );

  const valueSeries = valueSeriesData?.data || [];

  // Latest rates for benchmark comparison
  const { data: ratesData } = useLatestRates();
  const rates = ratesData?.data || [];

  // Calculate performance metrics
  const metrics = useMemo(() => {
    if (valueSeries.length < 2) {
      return {
        totalReturn: 0,
        totalReturnPercent: 0,
        bestDay: null,
        worstDay: null,
        volatility: 0,
        averageValue: 0,
      };
    }

    const values = valueSeries.map((s) => s.value);
    const startValue = values[0];
    const endValue = values[values.length - 1];
    const totalReturn = endValue - startValue;
    const totalReturnPercent = startValue > 0 ? (totalReturn / startValue) * 100 : 0;

    // Daily returns
    const dailyReturns = [];
    for (let i = 1; i < valueSeries.length; i++) {
      const prevValue = valueSeries[i - 1].value;
      const currentValue = valueSeries[i].value;
      const dailyReturn = prevValue > 0 ? ((currentValue - prevValue) / prevValue) * 100 : 0;
      dailyReturns.push({
        date: valueSeries[i].date,
        value: currentValue,
        change: currentValue - prevValue,
        changePercent: dailyReturn,
      });
    }

    // Find best and worst days
    const sortedByReturn = [...dailyReturns].sort((a, b) => b.changePercent - a.changePercent);
    const bestDay = sortedByReturn[0] || null;
    const worstDay = sortedByReturn[sortedByReturn.length - 1] || null;

    // Calculate volatility (standard deviation of daily returns)
    const avgReturn = dailyReturns.reduce((sum, d) => sum + d.changePercent, 0) / dailyReturns.length;
    const variance = dailyReturns.reduce((sum, d) => sum + Math.pow(d.changePercent - avgReturn, 2), 0) / dailyReturns.length;
    const volatility = Math.sqrt(variance);

    // Average value
    const averageValue = values.reduce((sum, v) => sum + v, 0) / values.length;

    return {
      totalReturn,
      totalReturnPercent,
      bestDay,
      worstDay,
      volatility,
      averageValue,
      dailyReturns,
    };
  }, [valueSeries]);

  // Benchmark data (e.g., USD, EUR, Gram Altın)
  const benchmarkData = useMemo(() => {
    const usdRate = rates.find((r) => r.type === 'currency' && r.name === 'Dolar');
    const eurRate = rates.find((r) => r.type === 'currency' && r.name === 'Euro');
    const goldRate = rates.find((r) => r.type === 'gold' && r.name === 'Gram Altın');

    return {
      usd: usdRate ? usdRate.sellPrice : null,
      eur: eurRate ? eurRate.sellPrice : null,
      gold: goldRate ? goldRate.sellPrice : null,
    };
  }, [rates]);

  // Handle portfolio selection
  const handlePortfolioChange = (value) => {
    setSelectedPortfolio(value);
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  // Export handlers (placeholder for now)
  const handleExportExcel = () => {
    console.log('Export to Excel');
    // TODO: Implement Excel export
  };

  const handleExportPDF = () => {
    console.log('Export to PDF');
    // TODO: Implement PDF export
  };

  const exportMenuItems = [
    { key: 'excel', icon: <FileExcelOutlined />, label: 'Excel olarak indir', onClick: handleExportExcel },
    { key: 'pdf', icon: <FilePdfOutlined />, label: 'PDF olarak indir', onClick: handleExportPDF },
  ];

  // Table columns for daily returns
  const columns = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Portföy Değeri',
      dataIndex: 'value',
      key: 'value',
      render: (value) => formatTL(value),
      align: 'right',
    },
    {
      title: 'Günlük Değişim (₺)',
      dataIndex: 'change',
      key: 'change',
      render: (change) => (
        <span style={{ color: change >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {formatTL(change, false, true)}
        </span>
      ),
      align: 'right',
      sorter: (a, b) => a.change - b.change,
    },
    {
      title: 'Günlük Değişim (%)',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (percent) => (
        <span style={{ color: percent >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {formatPercent(percent, 2, true)}
        </span>
      ),
      align: 'right',
      sorter: (a, b) => a.changePercent - b.changePercent,
      defaultSortOrder: 'descend',
    },
  ];

  const loading = portfoliosLoading || seriesLoading;

  return (
    <div className="reports-page">
      <div className="page-header">
        <h1 className="page-title">Performans Raporları</h1>
        <p className="page-description">
          Portföy performansınızı analiz edin ve benchmark'larla karşılaştırın
        </p>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <label className="filter-label">Portföy Seçin</label>
            <Select
              placeholder="Bir portföy seçin"
              style={{ width: '100%' }}
              value={selectedPortfolio}
              onChange={handlePortfolioChange}
              loading={portfoliosLoading}
            >
              {portfolios.map((p) => (
                <Option key={p._id} value={p._id}>
                  {p.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={12}>
            <label className="filter-label">Tarih Aralığı</label>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              maxDate={dayjs()}
            />
          </Col>
        </Row>
      </Card>

      {!selectedPortfolio ? (
        <Card>
          <Empty description="Lütfen bir portföy seçin" />
        </Card>
      ) : loading ? (
        <Card loading />
      ) : valueSeries.length === 0 ? (
        <Card>
          <Empty description="Seçilen tarih aralığında veri bulunamadı" />
        </Card>
      ) : (
        <>
          {/* Performance Metrics */}
          <Row gutter={[16, 16]} className="metrics-row">
            <Col xs={24} sm={12} lg={6}>
              <Card className="metric-card">
                <Statistic
                  title="Toplam Getiri"
                  value={metrics.totalReturn}
                  precision={2}
                  prefix="₺"
                  valueStyle={{ color: metrics.totalReturn >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
                  suffix={
                    <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                      ({formatPercent(metrics.totalReturnPercent, 2, true)})
                    </span>
                  }
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="metric-card">
                <Statistic
                  title="En İyi Gün"
                  value={metrics.bestDay?.changePercent || 0}
                  precision={2}
                  suffix="%"
                  prefix={<RiseOutlined />}
                  valueStyle={{ color: 'var(--color-success)' }}
                />
                {metrics.bestDay && (
                  <div className="metric-date">{formatDate(metrics.bestDay.date)}</div>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="metric-card">
                <Statistic
                  title="En Kötü Gün"
                  value={metrics.worstDay?.changePercent || 0}
                  precision={2}
                  suffix="%"
                  prefix={<FallOutlined />}
                  valueStyle={{ color: 'var(--color-danger)' }}
                />
                {metrics.worstDay && (
                  <div className="metric-date">{formatDate(metrics.worstDay.date)}</div>
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="metric-card">
                <Statistic
                  title="Volatilite"
                  value={metrics.volatility}
                  precision={2}
                  suffix="%"
                  prefix={<LineChartOutlined />}
                  valueStyle={{ color: 'var(--color-primary)' }}
                />
                <div className="metric-subtitle">Günlük Std. Sapma</div>
              </Card>
            </Col>
          </Row>

          {/* Performance Chart */}
          <Card
            title="Portföy Değer Grafiği"
            className="chart-card"
            extra={
              <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
                <Button icon={<DownloadOutlined />}>Dışa Aktar</Button>
              </Dropdown>
            }
          >
            <PerformanceLineChart data={valueSeries} height={350} />
          </Card>

          {/* Daily Returns Table */}
          <Card title="Günlük Getiriler" className="table-card">
            <Table
              columns={columns}
              dataSource={metrics.dailyReturns || []}
              rowKey={(record) => record.date}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Toplam ${total} kayıt`,
              }}
              scroll={{ x: 800 }}
            />
          </Card>

          {/* Benchmark Info (Placeholder) */}
          <Card title="Benchmark Bilgileri" className="benchmark-card">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Statistic
                  title="USD"
                  value={benchmarkData.usd || 0}
                  precision={2}
                  prefix="₺"
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="EUR"
                  value={benchmarkData.eur || 0}
                  precision={2}
                  prefix="₺"
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title="Gram Altın"
                  value={benchmarkData.gold || 0}
                  precision={2}
                  prefix="₺"
                />
              </Col>
            </Row>
            <div className="benchmark-note">
              <strong>Not:</strong> Karşılaştırma grafiği özelliği gelecek sürümde eklenecektir.
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;

