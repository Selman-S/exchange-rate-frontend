// pages/Portfolio/PortfolioList.js

import React, { useEffect, useState } from 'react';
import { Typography, Button, Table, Modal, Form, Input } from 'antd';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const PortfolioList = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/portfolios');
      setPortfolios(response.data.data);
    } catch (error) {
      console.error('Portföyleri alırken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const columns = [
    {
      title: 'Portföy Adı',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/portfolio/${record._id}`}>{text}</Link>,
    },
    {
      title: 'Oluşturma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      await api.post('/portfolios', values);
      fetchPortfolios();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Portföy oluşturulurken hata oluştu:', error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <Title level={2}>Portföylerim</Title>
      <Button type="primary" onClick={showModal} style={{ marginBottom: '20px' }}>
        Yeni Portföy Oluştur
      </Button>
      <Table
        dataSource={portfolios}
        columns={columns}
        rowKey="_id"
        loading={loading}
      />

      <Modal
        title="Yeni Portföy Oluştur"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form onFinish={handleOk}>
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Lütfen portföy adını girin!' }]}
          >
            <Input placeholder="Portföy Adı" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Oluştur
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PortfolioList;
