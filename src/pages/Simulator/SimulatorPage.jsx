// pages/Simulator/SimulatorPage.jsx

import React, { useState } from 'react';
import {
  Card,
  Form,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  message,
  Divider,
} from 'antd';
import {
  CalculatorOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useRateNames } from '../../hooks/useMarket';
import { formatTL, formatPercent } from '../../utils/formatters';
import api from '../../services/api';
import moment from 'moment';
import './SimulatorPage.css';

const { Title, Text } = Typography;
const { Option } = Select;

const SimulatorPage = () => {
  const [form] = Form.useForm();
  const [assetType, setAssetType] = useState('gold');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Asset names
  const { data: assetNamesData } = useRateNames(assetType);
  const assetNames = assetNamesData?.data || [];

  // Form submit
  const handleCalculate = async (values) => {
    try {
      setLoading(true);
      
      const payload = {
        assetType: values.assetType,
        assetName: values.assetName,
        amount: values.amount,
        investmentDate: values.investmentDate.format('YYYY-MM-DD'),
        comparisonDate: values.comparisonDate
          ? values.comparisonDate.format('YYYY-MM-DD')
          : undefined,
      };

      const response = await api.post('/rates/calculate-return', payload);
      
      if (response.success) {
        setResult(response.data);
        message.success('Getiri hesaplandı!');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Hesaplama sırasında hata oluştu';
      message.error(errorMsg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    form.resetFields();
    setResult(null);
  };

  return (
    <div className="simulator-page">
      <Card className="simulator-header">
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0 }}>
            <CalculatorOutlined style={{ marginRight: 8 }} />
            Getiri Simülatörü
          </Title>
          <Text type="secondary">
            "Geçmişte bu varlığı alsaydım ne kadar kazanırdım?" sorusunun yanıtını bulun
          </Text>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Form Card */}
        <Col xs={24} lg={12}>
          <Card title="Yatırım Bilgileri" className="simulator-form-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCalculate}
              initialValues={{
                assetType: 'gold',
                amount: 100,
                investmentDate: moment().subtract(1, 'year'),
              }}
            >
              <Form.Item
                name="assetType"
                label="Varlık Türü"
                rules={[{ required: true, message: 'Varlık türü seçin' }]}
              >
                <Select onChange={(value) => setAssetType(value)}>
                  <Option value="gold">Altın</Option>
                  <Option value="currency">Döviz</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="assetName"
                label="Varlık"
                rules={[{ required: true, message: 'Varlık seçin' }]}
              >
                <Select
                  showSearch
                  placeholder="Varlık seçin"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {assetNames.map((name) => (
                    <Option key={name} value={name}>
                      {name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="amount"
                label="Miktar"
                rules={[
                  { required: true, message: 'Miktar girin' },
                  { type: 'number', min: 0.01, message: 'Geçerli bir miktar girin' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Miktar"
                  min={0.01}
                  step={1}
                />
              </Form.Item>

              <Form.Item
                name="investmentDate"
                label="Alış Tarihi"
                rules={[{ required: true, message: 'Alış tarihi seçin' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  disabledDate={(current) => current && current > moment().endOf('day')}
                  placeholder="Alış tarihi seçin"
                />
              </Form.Item>

              <Form.Item
                name="comparisonDate"
                label="Karşılaştırma Tarihi (Opsiyonel)"
                extra="Boş bırakırsanız bugünün fiyatı kullanılır"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  disabledDate={(current) => {
                    const investmentDate = form.getFieldValue('investmentDate');
                    return (
                      current &&
                      (current < investmentDate || current > moment().endOf('day'))
                    );
                  }}
                  placeholder="Karşılaştırma tarihi seçin"
                />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading} icon={<CalculatorOutlined />}>
                    Hesapla
                  </Button>
                  <Button onClick={handleReset}>Sıfırla</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Results Card */}
        <Col xs={24} lg={12}>
          {result ? (
            <Card title="Getiri Sonuçları" className="simulator-result-card">
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Summary */}
                <div className="result-summary">
                  <Text strong style={{ fontSize: 16 }}>
                    {result.amount} {result.assetName}
                  </Text>
                  <Text type="secondary">
                    {moment(result.investmentDate).format('DD.MM.YYYY')} -{' '}
                    {moment(result.comparisonDate).format('DD.MM.YYYY')}
                  </Text>
                  <Text type="secondary">({result.durationDays} gün)</Text>
                </div>

                <Divider />

                {/* Stats */}
                <Row gutter={[16, 16]}>
                  <Col xs={12}>
                    <Statistic
                      title="Başlangıç Değeri"
                      value={result.initialValue}
                      prefix="₺"
                      precision={2}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title="Güncel Değer"
                      value={result.currentValue}
                      prefix="₺"
                      precision={2}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title="Başlangıç Fiyatı"
                      value={result.initialPrice}
                      prefix="₺"
                      precision={2}
                    />
                  </Col>
                  <Col xs={12}>
                    <Statistic
                      title="Güncel Fiyat"
                      value={result.currentPrice}
                      prefix="₺"
                      precision={2}
                    />
                  </Col>
                </Row>

                <Divider />

                {/* Returns */}
                <div className="result-returns">
                  <Card
                    className={
                      result.totalReturn >= 0
                        ? 'return-card positive'
                        : 'return-card negative'
                    }
                  >
                    <Statistic
                      title="Toplam Getiri"
                      value={result.totalReturn}
                      prefix={result.totalReturn >= 0 ? <RiseOutlined /> : <FallOutlined />}
                      suffix="₺"
                      precision={2}
                      valueStyle={{
                        color: result.totalReturn >= 0 ? '#52c41a' : '#ff4d4f',
                        fontSize: 28,
                      }}
                    />
                    <div className="return-percent">
                      <Text
                        strong
                        style={{
                          color: result.returnPercent >= 0 ? '#52c41a' : '#ff4d4f',
                          fontSize: 20,
                        }}
                      >
                        {result.returnPercent >= 0 ? '+' : ''}
                        {formatPercent(result.returnPercent)}
                      </Text>
                    </div>
                  </Card>

                  <Card className="return-card">
                    <Statistic
                      title="Yıllık Getiri"
                      value={result.annualizedReturn}
                      suffix="%"
                      precision={2}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ fontSize: 24 }}
                    />
                  </Card>
                </div>

                {/* Info */}
                <div className="result-info">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    * Yıllık getiri, bileşik getiri formülü ile hesaplanmıştır.
                    <br />* Hesaplamalar satış fiyatları üzerinden yapılmıştır.
                  </Text>
                </div>
              </Space>
            </Card>
          ) : (
            <Card className="simulator-placeholder">
              <div className="placeholder-content">
                <CalculatorOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />
                <Title level={4} type="secondary">
                  Getiri Hesapla
                </Title>
                <Text type="secondary">
                  Soldaki formu doldurun ve "Hesapla" butonuna tıklayın
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default SimulatorPage;

