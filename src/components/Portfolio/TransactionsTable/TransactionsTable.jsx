// src/components/Portfolio/TransactionsTable/TransactionsTable.jsx
import React, { useState } from 'react';
import { Table, Tag, Button, Popconfirm, Input, Select, message, Space, Dropdown } from 'antd';
import {
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ShoppingOutlined,
  DollarOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useTransactions, useDeleteTransaction } from '../../../hooks/usePortfolio';
import { formatTL, formatDate, formatDateTime } from '../../../utils/formatters';
import { exportTransactionsToCSV, exportTransactionsToExcel } from '../../../utils/exporters';
import './TransactionsTable.css';

const { Search } = Input;
const { Option } = Select;

const TransactionsTable = ({ portfolioId, portfolioName = 'Portfolio' }) => {
  const [searchText, setSearchText] = useState('');
  const [sideFilter, setSideFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Fetch transactions
  const { data, isLoading, error } = useTransactions(portfolioId, {
    search: searchText,
    side: sideFilter,
    page: currentPage,
    limit: pageSize,
  });

  // Delete mutation
  const { mutate: deleteTransaction, isPending: isDeleting } = useDeleteTransaction();

  const handleDelete = (transactionId) => {
    deleteTransaction(
      { portfolioId, transactionId },
      {
        onSuccess: () => {
          message.success('İşlem başarıyla silindi');
        },
        onError: (error) => {
          message.error(error.message || 'İşlem silinirken bir hata oluştu');
        },
      }
    );
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFilterChange = (value) => {
    setSideFilter(value);
    setCurrentPage(1);
  };

  // Export fonksiyonları
  const handleExportCSV = () => {
    if (!data?.data || data.data.length === 0) {
      message.warning('Export edilecek işlem bulunamadı');
      return;
    }
    
    exportTransactionsToCSV(data.data, portfolioName);
    message.success('İşlemler CSV olarak indirildi');
  };

  const handleExportExcel = () => {
    if (!data?.data || data.data.length === 0) {
      message.warning('Export edilecek işlem bulunamadı');
      return;
    }
    
    exportTransactionsToExcel(data.data, portfolioName);
    message.success('İşlemler Excel olarak indirildi');
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

  const columns = [
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'İşlem',
      dataIndex: 'side',
      key: 'side',
      width: 80,
      render: (side) => (
        <Tag color={side === 'BUY' ? 'green' : 'red'}>
          {side === 'BUY' ? 'ALIŞ' : 'SATIŞ'}
        </Tag>
      ),
    },
    {
      title: 'Enstrüman',
      key: 'asset',
      width: 200,
      render: (_, record) => (
        <div className="asset-cell">
          <div className="asset-icon">
            {record.assetType === 'gold' ? (
              <DollarOutlined style={{ color: '#faad14' }} />
            ) : (
              <ShoppingOutlined style={{ color: '#1890ff' }} />
            )}
          </div>
          <div className="asset-info">
            <div className="asset-name">{record.assetName}</div>
            <Tag color={record.assetType === 'gold' ? 'gold' : 'blue'} style={{ fontSize: '11px' }}>
              {record.assetType === 'gold' ? 'Altın' : 'Döviz'}
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
      align: 'right',
      render: (amount) => amount.toLocaleString('tr-TR', { maximumFractionDigits: 6 }),
    },
    {
      title: 'Fiyat (₺)',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (price) => formatTL(price),
    },
    {
      title: 'Toplam (₺)',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 130,
      align: 'right',
      render: (totalValue, record) => (
        <span className={record.side === 'BUY' ? 'text-loss' : 'text-gain'}>
          {record.side === 'BUY' ? '-' : '+'}{formatTL(totalValue)}
        </span>
      ),
    },
    {
      title: 'Fiyat Modu',
      dataIndex: 'priceMode',
      key: 'priceMode',
      width: 100,
      render: (priceMode) => (
        <Tag color={priceMode === 'AUTO' ? 'blue' : 'orange'}>
          {priceMode === 'AUTO' ? 'Otomatik' : 'Manuel'}
        </Tag>
      ),
    },
    {
      title: 'Not',
      dataIndex: 'note',
      key: 'note',
      width: 150,
      ellipsis: true,
      render: (note) => note || '-',
    },
    {
      title: 'Oluşturma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (createdAt) => formatDateTime(createdAt),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="İşlem silinecek"
          description="Bu işlemi silmek istediğinize emin misiniz?"
          onConfirm={() => handleDelete(record._id)}
          okText="Sil"
          cancelText="İptal"
          okButtonProps={{ danger: true, loading: isDeleting }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
          />
        </Popconfirm>
      ),
    },
  ];

  if (error) {
    return (
      <div className="error-state">
        <p>İşlemler yüklenirken bir hata oluştu: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="transactions-table-wrapper">
      {/* Filtreler ve Export */}
      <div className="table-filters">
        <Space size="middle">
          <Search
            placeholder="Enstrüman ara..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch('')}
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select
            placeholder="İşlem Türü"
            allowClear
            onChange={handleFilterChange}
            style={{ width: 150 }}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="BUY">Alış</Option>
            <Option value="SELL">Satış</Option>
          </Select>
        </Space>
        
        {/* Export Button */}
        {data?.data && data.data.length > 0 && (
          <Dropdown
            menu={{ items: exportMenuItems }}
            placement="bottomRight"
          >
            <Button icon={<DownloadOutlined />}>
              Dışa Aktar
            </Button>
          </Dropdown>
        )}
      </div>

      {/* Tablo */}
      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.total || 0,
          showTotal: (total) => `Toplam ${total} işlem`,
          showSizeChanger: false,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: 1300 }}
        className="transactions-table"
        locale={{
          emptyText: searchText || sideFilter
            ? 'Filtrelere uygun işlem bulunamadı'
            : 'Henüz işlem kaydı bulunmuyor',
        }}
      />
    </div>
  );
};

export default TransactionsTable;

