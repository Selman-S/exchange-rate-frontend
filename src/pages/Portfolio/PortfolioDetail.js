// pages/Portfolio/PortfolioDetail.js

import React, { useEffect, useState } from 'react';
import { Typography, Button, Table, Modal, Form, Input, Select, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { useParams } from 'react-router-dom';
import { formatTL } from '../../utils/formatTL';
import moment from 'moment-timezone'; // moment-timezone ekledik

const { Title } = Typography;
const { Option } = Select;

const PortfolioDetail = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [assetNames, setAssetNames] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [typeRates, setTypeRates] = useState([]);
  const [costPrice, setCostPrice] = useState(null);

  const [form] = Form.useForm();

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const [portfolioRes, assetsRes, ratesRes] = await Promise.all([
        api.get(`/portfolios/${id}`),
        api.get(`/portfolios/${id}/assets`),
        api.get('/rates'),
      ]);
      setPortfolio(portfolioRes.data.data);
      setAssets(assetsRes.data.data);
      setRates(ratesRes.data.data);
    } catch (error) {
      console.error('Portföy detaylarını alırken hata oluştu:', error);
      message.error('Portföy detaylarını alırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Varlığı silmek istediğinize emin misiniz?',
      content: `${record.name} varlığı silinecek.`,
      okText: 'Evet',
      okType: 'danger',
      cancelText: 'Hayır',
      onOk: () => deleteAsset(record._id),
    });
  };

  const deleteAsset = async (assetId) => {
    try {
      await api.delete(`/portfolios/${id}/assets/${assetId}`);
      message.success('Varlık başarıyla silindi');
      fetchPortfolio();
    } catch (error) {
      console.error('Varlık silinirken hata oluştu:', error);
      message.error('Varlık silinirken hata oluştu');
    }
  };

  const columns = [
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: (text) => (text === 'gold' ? 'Altın' : 'Döviz'),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Miktar',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) => `${text}`,
    },
    {
      title: 'Maliyet Fiyatı',
      key: 'totalCostPrice',
      render: (text, record) => {
        const totalCostPrice = record.amount * record.costPrice;
        return `${formatTL(totalCostPrice)}`;
      },
    },
    {
      title: 'Değer',
      key: 'value',
      render: (record) => {
        const rate = rates.find(
          (r) => r.type === record.type && r.name === record.name
        );
        if (rate) {
          const currentValue = record.amount * rate.buyPrice;
          return `${formatTL(currentValue)}`;
        } else {
          return 'N/A';
        }
      },
    },
    {
      title: 'Değişim (%)',
      key: 'change',
      render: (record) => {
        const rate = rates.find(
          (r) => r.type === record.type && r.name === record.name
        );
        if (rate) {
          const costAmount = record.amount * record.costPrice;
          const currentValue = record.amount * rate.buyPrice;
          const change = ((currentValue - costAmount) / costAmount) * 100;
          const color = change >= 0 ? 'green' : 'red';
          return (
            <span style={{ color }}>
              {change >= 0 ? '+' : ''}
              {change.toFixed(2)}%
            </span>
          );
        } else {
          return 'N/A';
        }
      },
    },
    {
      title: 'Alış Tarihi',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: (text) => moment(text).tz('Europe/Istanbul').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (text, record) => (
        <Button
          type="text"
          icon={<DeleteOutlined style={{ color: 'red' }} />}
          onClick={() => handleDelete(record)}
        />
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      const assetData = {
        ...values,
        costPrice,
      };
      await api.post(`/portfolios/${id}/assets`, assetData);
      fetchPortfolio();
      setIsModalVisible(false);
      message.success('Varlık başarıyla eklendi');
      // Formu ve state'i sıfırla
      form.resetFields();
      setSelectedType(null);
      setAssetNames([]);
      setTypeRates([]);
      setCostPrice(null);
    } catch (error) {
      console.error('Varlık eklenirken hata oluştu:', error);
      message.error('Varlık eklenirken hata oluştu');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    // Formu ve state'i sıfırla
    form.resetFields();
    setSelectedType(null);
    setAssetNames([]);
    setTypeRates([]);
    setCostPrice(null);
  };

  return (
    <div>
      {portfolio && (
        <>
          <Title level={2}>{portfolio.name}</Title>
          <Button type="primary" onClick={showModal} style={{ marginBottom: '20px' }}>
            Yeni Varlık Ekle
          </Button>
          <Table
            dataSource={assets}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={false}
            summary={(pageData) => {
              let totalCost = 0;
              let totalCurrent = 0;

              pageData.forEach((record) => {
                const costAmount = record.amount * record.costPrice;
                totalCost += costAmount;

                const rate = rates.find(
                  (r) => r.type === record.type && r.name === record.name
                );
                if (rate) {
                  const currentValue = record.amount * rate.buyPrice;
                  totalCurrent += currentValue;
                }
              });

              const totalChange = ((totalCurrent - totalCost) / totalCost) * 100;
              const color = totalChange >= 0 ? 'green' : 'red';

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3}>
                    <strong>Toplam</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <strong>{formatTL(totalCost)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <strong>{formatTL(totalCurrent)}</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <strong style={{ color }}>
                      {totalChange >= 0 ? '+' : ''}
                      {totalChange.toFixed(2)}%
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell colSpan={2} />
                </Table.Summary.Row>
              );
            }}
          />

          <Modal
            title="Yeni Varlık Ekle"
            visible={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <Form form={form} onFinish={handleOk}>
              <Form.Item
                name="type"
                rules={[{ required: true, message: 'Lütfen varlık türünü seçin!' }]}
              >
                <Select
                  placeholder="Varlık Türü"
                  onChange={async (value) => {
                    setSelectedType(value);
                    // Varlık adlarını fetch et
                    try {
                      const response = await api.get('/rates/names', {
                        params: { type: value },
                      });
                      setAssetNames(response.data.data);

                      // Seçilen türe ait kurları fetch et
                      const ratesResponse = await api.get('/rates', {
                        params: { type: value },
                      });
                      setTypeRates(ratesResponse.data.data);

                      // Seçili varlık adı ve maliyet fiyatını sıfırla
                      form.setFieldsValue({ name: undefined });
                      setCostPrice(null);
                    } catch (error) {
                      console.error('Varlık adları veya kurları alınırken hata oluştu:', error);
                      message.error('Varlık adları veya kurları alınırken hata oluştu');
                    }
                  }}
                >
                  <Option value="gold">Altın</Option>
                  <Option value="currency">Döviz</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Lütfen varlık adını seçin!' }]}
              >
                <Select
                  placeholder="Varlık Adı"
                  disabled={!selectedType || assetNames.length === 0}
                  onChange={(value) => {
                    // Seçilen varlık adına göre maliyet fiyatını belirle
                    const rate = typeRates.find((r) => r.name === value);
                    if (rate) {
                      setCostPrice(rate.sellPrice);
                    } else {
                      setCostPrice(null);
                    }
                  }}
                >
                  {assetNames.map((name) => (
                    <Option key={name} value={name}>
                      {name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              {costPrice && (
                <div style={{ marginBottom: '16px' }}>
                  Maliyet Fiyatı: <strong>{formatTL(costPrice)}</strong>
                </div>
              )}
              <Form.Item
                name="amount"
                rules={[{ required: true, message: 'Lütfen miktarı girin!' }]}
              >
                <Input placeholder="Miktar" type="number" min="0" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Ekle
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </>
      )}
    </div>
  );
};

export default PortfolioDetail;
