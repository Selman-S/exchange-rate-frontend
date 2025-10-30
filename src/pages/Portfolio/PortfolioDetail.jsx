// src/pages/Portfolio/PortfolioDetail.jsx
import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Tabs, message } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Loading, EmptyState, Card } from '../../components/Common';
import { PortfolioSummaryCard, PerformanceTable, AddAssetModal, TransactionsTable } from '../../components/Portfolio';
import { DonutChart, PerformanceLineChart, PeriodSelector } from '../../components/Chart';
import { 
  usePortfolio, 
  usePortfolioSummary, 
  usePortfolioAssets,
  usePortfolioValueSeries,
  useCreateAsset,
  useDeleteAsset 
} from '../../hooks';
import './PortfolioDetail.css';

/**
 * PortfolioDetail Component
 * Portföy detay sayfası - grafikler, tablolar
 */
const PortfolioDetail = () => {
  const { id } = useParams();
  const [addAssetVisible, setAddAssetVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('6M');

  // Queries
  const { data: portfolioData, isLoading: portfolioLoading } = usePortfolio(id);
  const { data: summaryData, isLoading: summaryLoading } = usePortfolioSummary(id);
  const { data: assetsData, isLoading: assetsLoading } = usePortfolioAssets(id);
  const { data: valueSeriesData, isLoading: valueSeriesLoading } = usePortfolioValueSeries(id, selectedPeriod);

  // Mutations
  const createAssetMutation = useCreateAsset();
  const deleteAssetMutation = useDeleteAsset();

  const portfolio = portfolioData?.data;
  const summary = summaryData?.data;
  const assets = assetsData?.data || [];

  // Handlers
  const handleAddAsset = async (assetData) => {
    try {
      await createAssetMutation.mutateAsync({
        portfolioId: id,
        data: assetData,
      });
      message.success('Varlık eklendi');
    } catch (error) {
      message.error('Varlık eklenirken hata oluştu');
      throw error;
    }
  };

  const handleDeleteAsset = async (assetId) => {
    await deleteAssetMutation.mutateAsync({
      portfolioId: id,
      assetId,
    });
  };

  // Dağılım grafiği için veri hazırla (varlık bazında)
  const allocationData = useMemo(() => {
    if (!assets || assets.length === 0) return [];

    // Her varlık için toplam değeri hesapla
    const assetTotals = {};
    let grandTotal = 0;

    assets.forEach((asset) => {
      const assetValue = asset.amount * asset.costPrice;
      
      if (assetTotals[asset.name]) {
        assetTotals[asset.name] += assetValue;
      } else {
        assetTotals[asset.name] = assetValue;
      }
      
      grandTotal += assetValue;
    });

    // Veriyi dizi formatına çevir ve yüzdeyi hesapla
    const data = Object.entries(assetTotals).map(([name, value]) => ({
      name,
      value,
      percent: ((value / grandTotal) * 100).toFixed(1),
    }));

    // Değere göre sırala (büyükten küçüğe)
    return data.sort((a, b) => b.value - a.value);
  }, [assets]);

  // Performans grafiği için gerçek veri
  const performanceData = useMemo(() => {
    if (!valueSeriesData?.data) return [];
    
    // Backend'den gelen veriyi frontend formatına çevir
    // Period'a göre tarih formatını ayarla
    let dateFormat = { month: 'short', year: 'numeric' };
    
    if (selectedPeriod === '1W' || selectedPeriod === '1M') {
      dateFormat = { day: 'numeric', month: 'short' };
    } else if (selectedPeriod === '3M') {
      dateFormat = { day: 'numeric', month: 'short' };
    }
    
    return valueSeriesData.data.map(item => ({
      date: new Date(item.date).toLocaleDateString('tr-TR', dateFormat),
      value: item.value,
      change: item.change,
    }));
  }, [valueSeriesData, selectedPeriod]);

  if (portfolioLoading || summaryLoading) {
    return (
      <div className="portfolio-detail-loading">
        <Loading size="lg" text="Portföy yükleniyor..." />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <EmptyState
        icon="❌"
        title="Portföy bulunamadı"
        description="Aradığınız portföy mevcut değil veya silinmiş olabilir"
        action={
          <Link to="/portfolios">
            <Button type="primary">Portföylere Dön</Button>
          </Link>
        }
      />
    );
  }

  const tabItems = [
    {
      key: 'overview',
      label: 'Genel Bakış',
      children: (
        <div className="tab-content">
          <div className="portfolio-charts">
            {/* Performans Grafiği */}
            <Card 
              title="Portföy Performansı"
              extra={
                <PeriodSelector 
                  value={selectedPeriod}
                  onChange={setSelectedPeriod}
                />
              }
            >
              <PerformanceLineChart 
                data={performanceData} 
                loading={valueSeriesLoading}
              />
            </Card>

            {/* Varlık Dağılımı */}
            <Card title="Varlık Dağılımı">
              {assets.length > 0 ? (
                <DonutChart
                  data={allocationData}
                  colors={[
                    '#1890ff', '#52c41a', '#faad14', '#f5222d', 
                    '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16',
                    '#a0d911', '#2f54eb', '#fadb14', '#fa541c'
                  ]}
                />
              ) : (
                <EmptyState
                  icon="📊"
                  title="Henüz varlık yok"
                  description="Portföyünüze varlık ekleyerek dağılımı görüntüleyin"
                />
              )}
            </Card>
          </div>
        </div>
      ),
    },
    {
      key: 'assets',
      label: `Varlıklar (${assets.length})`,
      children: (
        <div className="tab-content">
          <PerformanceTable
            assets={assets}
            onDeleteAsset={handleDeleteAsset}
            loading={assetsLoading}
            portfolioName={portfolio?.name || 'Portfolio'}
          />
        </div>
      ),
    },
    {
      key: 'transactions',
      label: 'İşlem Geçmişi',
      children: (
        <div className="tab-content">
          <TransactionsTable 
            portfolioId={id} 
            portfolioName={portfolio?.name || 'Portfolio'} 
          />
        </div>
      ),
    },
  ];

  return (
    <div className="portfolio-detail-page">
      {/* Header */}
      <div className="portfolio-detail-header">
        <div className="header-left">
          <Link to="/portfolios" className="back-link">
            <ArrowLeftOutlined /> Portföylere Dön
          </Link>
          <h1 className="portfolio-detail-title">{portfolio.name}</h1>
          {portfolio.description && (
            <p className="portfolio-detail-description">{portfolio.description}</p>
          )}
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setAddAssetVisible(true)}
        >
          Varlık Ekle
        </Button>
      </div>

      {/* Summary Card */}
      <PortfolioSummaryCard summary={summary} loading={summaryLoading} />

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        items={tabItems}
        className="portfolio-detail-tabs"
      />

      {/* Add Asset Modal */}
      <AddAssetModal
        visible={addAssetVisible}
        onClose={() => setAddAssetVisible(false)}
        onSubmit={handleAddAsset}
        loading={createAssetMutation.isPending}
      />
    </div>
  );
};

export default PortfolioDetail;

