// src/components/Portfolio/PerformanceTable/PerformanceTable.jsx
import React, { useMemo } from 'react';
import { Table, Button, Modal, message, Tag, Dropdown, Space } from 'antd';
import { DeleteOutlined, DownloadOutlined, FileExcelOutlined, FileTextOutlined } from '@ant-design/icons';
import { formatTL, formatPercent, formatDate } from '../../../utils/formatters';
import { exportAssetsToCSV, exportAssetsToExcel } from '../../../utils/exporters';
import { useLatestRates } from '../../../hooks';
import './PerformanceTable.css';

/**
 * PerformanceTable Component
 * Portföydeki varlıkların performans tablosu
 */
const PerformanceTable = ({ assets = [], onDeleteAsset, loading = false, portfolioName = 'Portfolio' }) => {
  // En güncel fiyatları çek
  const { data: ratesData, isLoading: ratesLoading } = useLatestRates();
  const rates = ratesData?.data || [];

  // Tablo verilerini hesapla
  const tableData = useMemo(() => {
    return assets.map((asset) => {
      const rate = rates.find(
        (r) => r.type === asset.type && r.name === asset.name
      );

      const costAmount = asset.amount * asset.costPrice;
      const currentValue = rate ? asset.amount * rate.buyPrice : costAmount;
      const pnl = currentValue - costAmount;
      const pnlPercent = costAmount > 0 ? (pnl / costAmount) * 100 : 0;
      const portfolioShare = 0; // Sonradan hesaplanacak

      return {
        ...asset,
        currentPrice: rate?.buyPrice || asset.costPrice,
        costAmount,
        currentValue,
        pnl,
        pnlPercent,
        portfolioShare,
      };
    });
  }, [assets, rates]);

  // Toplam değeri hesapla ve portföy paylarını güncelle
  const enhancedData = useMemo(() => {
    const totalValue = tableData.reduce((sum, item) => sum + item.currentValue, 0);
    return tableData.map((item) => ({
      ...item,
      portfolioShare: totalValue > 0 ? (item.currentValue / totalValue) * 100 : 0,
    }));
  }, [tableData]);

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Varlığı Sil',
      content: `"${record.name}" varlığını silmek istediğinizden emin misiniz?`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await onDeleteAsset(record._id);
          message.success('Varlık silindi');
        } catch (error) {
          message.error('Varlık silinirken hata oluştu');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Varlık',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
      render: (text, record) => (
        <div className="asset-cell">
          <span className="asset-icon">{record.type === 'gold' ? '🥇' : '💱'}</span>
          <div className="asset-info">
            <div className="asset-name">{text}</div>
            <Tag color={record.type === 'gold' ? 'gold' : 'green'} style={{ marginTop: 4 }}>
              {record.type === 'gold' ? 'Altın' : 'Döviz'}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (value) => value.toLocaleString('tr-TR'),
    },
    {
      title: 'Ort. Maliyet',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 130,
      render: (value) => formatTL(value),
    },
    {
      title: 'Mevcut Fiyat',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      width: 130,
      render: (value) => formatTL(value),
    },
    {
      title: 'Toplam Maliyet',
      dataIndex: 'costAmount',
      key: 'costAmount',
      width: 140,
      render: (value) => formatTL(value),
    },
    {
      title: 'Mevcut Değer',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 140,
      render: (value) => <strong>{formatTL(value)}</strong>,
    },
    {
      title: 'Kar/Zarar',
      dataIndex: 'pnl',
      key: 'pnl',
      width: 140,
      render: (value, record) => {
        const isPositive = value >= 0;
        return (
          <div className={isPositive ? 'text-gain' : 'text-loss'}>
            <div className="pnl-value">{formatTL(Math.abs(value))}</div>
            <div className="pnl-percent">
              ({formatPercent(record.pnlPercent, 2, true)})
            </div>
          </div>
        );
      },
    },
    {
      title: 'Portföy Payı',
      dataIndex: 'portfolioShare',
      key: 'portfolioShare',
      width: 120,
      render: (value) => formatPercent(value),
    },
    {
      title: 'Alış Tarihi',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 120,
      render: (value) => formatDate(value),
    },
    {
      title: 'Portföye Eklenme',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 130,
      render: (value) => formatDate(value),
    },
    {
      title: 'İşlem',
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        />
      ),
    },
  ];

  // Toplam satırı
  const summary = (pageData) => {
    const totalCost = pageData.reduce((sum, item) => sum + item.costAmount, 0);
    const totalValue = pageData.reduce((sum, item) => sum + item.currentValue, 0);
    const totalPnl = totalValue - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    const isPositive = totalPnl >= 0;

    return (
      <Table.Summary.Row className="summary-row">
        <Table.Summary.Cell index={0}>
          <strong>TOPLAM</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={1} />
        <Table.Summary.Cell index={2} />
        <Table.Summary.Cell index={3} />
        <Table.Summary.Cell index={4}>
          <strong>{formatTL(totalCost)}</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={5}>
          <strong>{formatTL(totalValue)}</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={6}>
          <div className={isPositive ? 'text-gain' : 'text-loss'}>
            <div className="pnl-value">
              <strong>{formatTL(Math.abs(totalPnl))}</strong>
            </div>
            <div className="pnl-percent">
              ({formatPercent(totalPnlPercent, 2, true)})
            </div>
          </div>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={7}>
          <strong>100%</strong>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={8} />
        <Table.Summary.Cell index={9} />
        <Table.Summary.Cell index={10} />
      </Table.Summary.Row>
    );
  };

  // Export fonksiyonları
  const handleExportCSV = () => {
    if (assets.length === 0) {
      message.warning('Export edilecek varlık bulunamadı');
      return;
    }
    
    // currentPrices map oluştur
    const currentPrices = {};
    rates.forEach(rate => {
      const key = `${rate.type}-${rate.name}`;
      currentPrices[key] = rate;
    });

    exportAssetsToCSV(assets, currentPrices, portfolioName);
    message.success('Varlıklar CSV olarak indirildi');
  };

  const handleExportExcel = () => {
    if (assets.length === 0) {
      message.warning('Export edilecek varlık bulunamadı');
      return;
    }
    
    // currentPrices map oluştur
    const currentPrices = {};
    rates.forEach(rate => {
      const key = `${rate.type}-${rate.name}`;
      currentPrices[key] = rate;
    });

    exportAssetsToExcel(assets, currentPrices, portfolioName);
    message.success('Varlıklar Excel olarak indirildi');
  };

  // Export dropdown menu items
  const exportMenuItems = [
    {
      key: 'csv',
      icon: <FileTextOutlined />,
      label: 'CSV olarak indir',
      onClick: handleExportCSV,
    },
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: 'Excel olarak indir',
      onClick: handleExportExcel,
    },
  ];

  return (
    <div className="performance-table">
      {/* Export Button */}
      {assets.length > 0 && (
        <div className="table-actions" style={{ marginBottom: 16, textAlign: 'right' }}>
          <Dropdown
            menu={{ items: exportMenuItems }}
            placement="bottomRight"
          >
            <Button icon={<DownloadOutlined />}>
              <Space>
                Dışa Aktar
              </Space>
            </Button>
          </Dropdown>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={enhancedData}
        rowKey="_id"
        loading={loading || ratesLoading}
        pagination={false}
        scroll={{ x: 1530 }}
        summary={enhancedData.length > 0 ? summary : undefined}
        locale={{
          emptyText: 'Henüz varlık eklenmemiş',
        }}
      />
    </div>
  );
};

export default PerformanceTable;

