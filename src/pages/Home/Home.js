// pages/Home/Home.js

import React, { useEffect, useState } from 'react';
import { Typography, Table } from 'antd';
import api from '../../services/api';
import { formatTL } from '../../utils/formatters';

const { Title } = Typography;

const Home = () => {
  const [rates, setRates] = useState([]);

  // startDate:'2024-11-01',
  // endDate:'2024-11-30'
  useEffect(() => {
    api.get('/rates').then((response) => {
      setRates(response.data.data);
    });
  }, []);

  const columns = [
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Alış Fiyatı',
      dataIndex: 'buyPrice',
      key: 'buyPrice',
      render: (text) => `${formatTL(text)}`,
    },
    {
      title: 'Satış Fiyatı',
      dataIndex: 'sellPrice',
      key: 'sellPrice',
      render: (text) => `${formatTL(text)}`,
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      render: (text) => new Date(text).toLocaleString(),
    },
  ];

  return (
    <div>
      <Title level={2}>Güncel Altın ve Döviz Fiyatları</Title>
      <Table dataSource={rates} columns={columns} rowKey="_id" />
    </div>
  );
};

export default Home;
