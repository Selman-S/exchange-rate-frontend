// src/components/Portfolio/CreatePortfolioModal/CreatePortfolioModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Input, Form, message } from 'antd';
import './CreatePortfolioModal.css';

const { TextArea } = Input;

/**
 * CreatePortfolioModal Component
 * Yeni portföy oluşturma veya düzenleme modal'ı
 */
const CreatePortfolioModal = ({
  visible,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const isEditing = !!initialData;

  useEffect(() => {
    if (visible) {
      if (initialData) {
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      message.success(isEditing ? 'Portföy güncellendi' : 'Portföy oluşturuldu');
      onClose();
    } catch (error) {
      if (error.errorFields) {
        // Form validation hatası
        return;
      }
      message.error(isEditing ? 'Portföy güncellenirken hata oluştu' : 'Portföy oluşturulurken hata oluştu');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? 'Portföyü Düzenle' : 'Yeni Portföy Oluştur'}
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={isEditing ? 'Güncelle' : 'Oluştur'}
      cancelText="İptal"
      confirmLoading={loading}
      width={500}
      className="create-portfolio-modal"
    >
      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="Portföy Adı"
          rules={[
            { required: true, message: 'Portföy adı gereklidir' },
            { min: 3, message: 'Portföy adı en az 3 karakter olmalıdır' },
            { max: 40, message: 'Portföy adı en fazla 40 karakter olabilir' },
          ]}
        >
          <Input
            placeholder="Örn: Ana Portföyüm"
            maxLength={40}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Açıklama (Opsiyonel)"
          rules={[
            { max: 200, message: 'Açıklama en fazla 200 karakter olabilir' },
          ]}
        >
          <TextArea
            placeholder="Portföy hakkında notlar..."
            rows={3}
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>

      <div className="create-portfolio-info">
        <p>💡 İpucu: Portföylerinizi farklı kategorilere ayırarak daha iyi yönetebilirsiniz.</p>
      </div>
    </Modal>
  );
};

export default CreatePortfolioModal;

