// pages/Alerts/AlertsPage.jsx

import React, { useState } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Radio,
  Typography,
  Switch,
  Popconfirm,
  message as antdMessage,
} from 'antd';
import {
  BellOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import {
  useAlerts,
  useCreateAlert,
  useUpdateAlert,
  useDeleteAlert,
  useToggleAlert,
} from '../../hooks/useAlerts';
import { useRateNames } from '../../hooks/useMarket';
import { formatTL } from '../../utils/formatters';
import moment from 'moment';
import './AlertsPage.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AlertsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form] = Form.useForm();

  // API Hooks
  const { data: alertsData, isLoading } = useAlerts(filterStatus);
  const createMutation = useCreateAlert();
  const updateMutation = useUpdateAlert();
  const deleteMutation = useDeleteAlert();
  const toggleMutation = useToggleAlert();

  // Asset names for selector
  const [assetType, setAssetType] = useState('gold');
  const { data: assetNamesData } = useRateNames(assetType);
  const assetNames = assetNamesData?.data || [];

  const alerts = alertsData?.data || [];

  // Modal açma/kapama
  const handleOpenModal = (alert = null) => {
    setEditingAlert(alert);
    
    if (alert) {
      form.setFieldsValue({
        assetType: alert.assetType,
        assetName: alert.assetName,
        condition: alert.condition,
        targetPrice: alert.targetPrice,
        priceField: alert.priceField,
        note: alert.note,
      });
      setAssetType(alert.assetType);
    } else {
      form.resetFields();
      setAssetType('gold');
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAlert(null);
    form.resetFields();
  };

  // Form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingAlert) {
        await updateMutation.mutateAsync({
          alertId: editingAlert._id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      
      handleCloseModal();
    } catch (err) {
      console.error('Form validation error:', err);
    }
  };

  // Toggle alarm
  const handleToggle = (alertId) => {
    toggleMutation.mutate(alertId);
  };

  // Delete alarm
  const handleDelete = (alertId) => {
    deleteMutation.mutate(alertId);
  };

  // Table columns
  const columns = [
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive, record) => (
        <Switch
          checked={isActive && !record.isTriggered}
          onChange={() => handleToggle(record._id)}
          disabled={record.isTriggered}
        />
      ),
    },
    {
      title: 'Varlık',
      dataIndex: 'assetName',
      key: 'assetName',
      render: (name, record) => (
        <Space>
          <Tag color={record.assetType === 'gold' ? 'gold' : 'blue'}>
            {record.assetType === 'gold' ? 'Altın' : 'Döviz'}
          </Tag>
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Koşul',
      dataIndex: 'condition',
      key: 'condition',
      width: 120,
      render: (condition) => {
        const icons = {
          ABOVE: <RiseOutlined />,
          BELOW: <FallOutlined />,
          EQUALS: '=',
        };
        const labels = {
          ABOVE: 'Üzerine',
          BELOW: 'Altına',
          EQUALS: 'Eşit',
        };
        return (
          <Space>
            {icons[condition]}
            {labels[condition]}
          </Space>
        );
      },
    },
    {
      title: 'Hedef Fiyat',
      dataIndex: 'targetPrice',
      key: 'targetPrice',
      align: 'right',
      render: (price) => formatTL(price),
    },
    {
      title: 'Fiyat Türü',
      dataIndex: 'priceField',
      key: 'priceField',
      width: 100,
      render: (field) => field === 'sellPrice' ? 'Satış' : 'Alış',
    },
    {
      title: 'Not',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (record.isTriggered) {
          return <Tag color="success">Tetiklendi</Tag>;
        }
        if (record.isActive) {
          return <Tag color="processing">Aktif</Tag>;
        }
        return <Tag color="default">Pasif</Tag>;
      },
    },
    {
      title: 'Tetiklenme',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      width: 150,
      render: (date) => date ? moment(date).format('DD.MM.YYYY HH:mm') : '-',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Alarmı silmek istediğinizden emin misiniz?"
            onConfirm={() => handleDelete(record._id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="alerts-page">
      <Card
        title={
          <Space>
            <BellOutlined />
            <Title level={3} style={{ margin: 0 }}>
              Fiyat Alarmları
            </Title>
          </Space>
        }
        extra={
          <Space>
            <Radio.Group value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <Radio.Button value="all">Hepsi</Radio.Button>
              <Radio.Button value="active">Aktif</Radio.Button>
              <Radio.Button value="triggered">Tetiklenmiş</Radio.Button>
            </Radio.Group>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
            >
              Yeni Alarm
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={alerts}
          columns={columns}
          rowKey="_id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingAlert ? 'Alarm Düzenle' : 'Yeni Alarm Oluştur'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleSubmit}
        okText={editingAlert ? 'Güncelle' : 'Oluştur'}
        cancelText="İptal"
        width={600}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="assetType"
            label="Varlık Türü"
            rules={[{ required: true, message: 'Varlık türü seçin' }]}
          >
            <Radio.Group onChange={(e) => setAssetType(e.target.value)}>
              <Radio.Button value="gold">Altın</Radio.Button>
              <Radio.Button value="currency">Döviz</Radio.Button>
            </Radio.Group>
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
            name="condition"
            label="Koşul"
            rules={[{ required: true, message: 'Koşul seçin' }]}
            initialValue="ABOVE"
          >
            <Radio.Group>
              <Radio value="ABOVE">Üzerine Çıkınca</Radio>
              <Radio value="BELOW">Altına Düşünce</Radio>
              <Radio value="EQUALS">Eşit Olunca</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="targetPrice"
            label="Hedef Fiyat"
            rules={[
              { required: true, message: 'Hedef fiyat girin' },
              { type: 'number', min: 0.01, message: 'Geçerli bir fiyat girin' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="₺"
              placeholder="Hedef fiyat"
              min={0.01}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="priceField"
            label="Fiyat Türü"
            initialValue="sellPrice"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="sellPrice">Satış Fiyatı</Radio>
              <Radio value="buyPrice">Alış Fiyatı</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="note" label="Not (Opsiyonel)">
            <TextArea rows={3} placeholder="Alarm hakkında not ekleyebilirsiniz" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AlertsPage;

