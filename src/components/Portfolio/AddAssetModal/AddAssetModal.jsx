// src/components/Portfolio/AddAssetModal/AddAssetModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, InputNumber, DatePicker, Radio, Switch, message } from 'antd';
import moment from 'moment';
import { useRateNames } from '../../../hooks';
import { fetchPriceAtDate } from '../../../services/marketApi';
import { formatTL } from '../../../utils/formatters';
import './AddAssetModal.css';

const { Option } = Select;

/**
 * AddAssetModal Component
 * Portföye yeni varlık ekleme modal'ı
 */
const AddAssetModal = ({ visible, onClose, onSubmit, loading = false }) => {
  const [form] = Form.useForm();
  const [assetType, setAssetType] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [manualPrice, setManualPrice] = useState(false);
  const [fetchedPrice, setFetchedPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // Varlık isimlerini çek
  const { data: goldNames } = useRateNames('gold', { enabled: assetType === 'gold' });
  const { data: currencyNames } = useRateNames('currency', { enabled: assetType === 'currency' });

  const assetNames = assetType === 'gold'
    ? goldNames?.data || []
    : assetType === 'currency'
    ? currencyNames?.data || []
    : [];

  // Fiyat çek
  useEffect(() => {
    if (assetType && selectedName && selectedDate && !manualPrice) {
      fetchPrice();
    }
  }, [assetType, selectedName, selectedDate, manualPrice]);

  const fetchPrice = async () => {
    setPriceLoading(true);
    try {
      const response = await fetchPriceAtDate({
        type: assetType,
        name: selectedName,
        date: selectedDate.format('YYYY-MM-DD'),
      });
      setFetchedPrice(response.data);
      if (!response.data.isExactMatch) {
        message.warning(response.data.message);
      }
    } catch (error) {
      message.error('Fiyat bilgisi alınamadı');
      setFetchedPrice(null);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const assetData = {
        type: values.type,
        name: values.name,
        amount: values.amount,
        purchaseDate: values.purchaseDate.toISOString(),
      };

      // Manuel fiyat girilmişse ekle
      if (manualPrice && values.costPrice) {
        assetData.costPrice = values.costPrice;
      }

      await onSubmit(assetData);
      handleClose();
    } catch (error) {
      // Form validation hatası
      console.error('Form validation error:', error);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setAssetType(null);
    setSelectedName(null);
    setSelectedDate(moment());
    setManualPrice(false);
    setFetchedPrice(null);
    onClose();
  };

  const handleTypeChange = (value) => {
    setAssetType(value);
    setSelectedName(null);
    setFetchedPrice(null);
    form.setFieldsValue({ name: undefined });
  };

  const handleNameChange = (value) => {
    setSelectedName(value);
    setFetchedPrice(null);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFetchedPrice(null);
  };

  return (
    <Modal
      title="Varlık Ekle"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleClose}
      okText="Ekle"
      cancelText="İptal"
      confirmLoading={loading}
      width={600}
      className="add-asset-modal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          purchaseDate: moment(),
          amount: 1,
        }}
      >
        {/* Tür */}
        <Form.Item
          name="type"
          label="Varlık Türü"
          rules={[{ required: true, message: 'Lütfen varlık türünü seçin' }]}
        >
          <Radio.Group onChange={(e) => handleTypeChange(e.target.value)} buttonStyle="solid">
            <Radio.Button value="gold">🥇 Altın</Radio.Button>
            <Radio.Button value="currency">💱 Döviz</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Varlık Adı */}
        <Form.Item
          name="name"
          label="Varlık"
          rules={[{ required: true, message: 'Lütfen varlık seçin' }]}
        >
          <Select
            placeholder="Varlık seçin"
            disabled={!assetType}
            onChange={handleNameChange}
            showSearch
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

        {/* Alış Tarihi */}
        <Form.Item
          name="purchaseDate"
          label="Alış Tarihi"
          rules={[{ required: true, message: 'Lütfen tarih seçin' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD.MM.YYYY"
            disabledDate={(current) => current && current > moment().endOf('day')}
            onChange={handleDateChange}
          />
        </Form.Item>

        {/* Miktar */}
        <Form.Item
          name="amount"
          label="Miktar"
          rules={[
            { required: true, message: 'Lütfen miktar girin' },
            { type: 'number', min: 0.000001, message: 'Miktar 0\'dan büyük olmalı' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Miktar"
            min={0.000001}
            step={0.1}
          />
        </Form.Item>

        {/* Manuel Fiyat Toggle */}
        <Form.Item label="Fiyat Girişi">
          <Switch
            checked={manualPrice}
            onChange={setManualPrice}
            checkedChildren="Manuel"
            unCheckedChildren="Otomatik"
          />
          <span style={{ marginLeft: 8, color: 'var(--color-text-secondary)', fontSize: '12px' }}>
            {manualPrice ? 'Manuel fiyat gireceksiniz' : 'Otomatik fiyat çekilecek'}
          </span>
        </Form.Item>

        {/* Otomatik Fiyat Gösterimi */}
        {!manualPrice && fetchedPrice && (
          <div className="price-info">
            <div className="price-label">Seçilen Tarihteki Satış Fiyatı:</div>
            <div className="price-value">{formatTL(fetchedPrice.sellPrice)}</div>
            {!fetchedPrice.isExactMatch && (
              <div className="price-note">
                ⚠️ {fetchedPrice.actualDate} tarihindeki fiyat kullanılacak
              </div>
            )}
          </div>
        )}

        {/* Manuel Fiyat */}
        {manualPrice && (
          <Form.Item
            name="costPrice"
            label="Maliyet Fiyatı (₺)"
            rules={[
              { required: true, message: 'Lütfen fiyat girin' },
              { type: 'number', min: 0.01, message: 'Fiyat 0\'dan büyük olmalı' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Maliyet fiyatı"
              min={0.01}
              step={0.01}
              formatter={(value) => `₺ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/₺\s?|(,*)/g, '')}
            />
          </Form.Item>
        )}

        {priceLoading && (
          <div className="price-loading">Fiyat bilgisi alınıyor...</div>
        )}
      </Form>
    </Modal>
  );
};

export default AddAssetModal;

