// src/pages/Portfolio/PortfolioList.jsx
import React, { useState } from 'react';
import { Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PortfolioCard from '../../components/Portfolio/PortfolioCard';
import CreatePortfolioModal from '../../components/Portfolio/CreatePortfolioModal';
import { EmptyState, Loading } from '../../components/Common';
import {
  usePortfolios,
  usePortfolioSummary,
  useCreatePortfolio,
  useUpdatePortfolio,
  useDeletePortfolio,
} from '../../hooks';
import './PortfolioList.css';

/**
 * PortfolioList Component
 * Kullanıcının tüm portföylerini listeler
 */
const PortfolioList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);

  // Queries
  const { data: portfoliosData, isLoading } = usePortfolios();
  
  // Mutations
  const createMutation = useCreatePortfolio();
  const updateMutation = useUpdatePortfolio();
  const deleteMutation = useDeletePortfolio();

  const portfolios = portfoliosData?.data || [];

  const handleCreate = async (values) => {
    await createMutation.mutateAsync(values);
  };

  const handleEdit = (portfolio) => {
    setEditingPortfolio(portfolio);
    setModalVisible(true);
  };

  const handleUpdate = async (values) => {
    if (!editingPortfolio) return;
    await updateMutation.mutateAsync({
      id: editingPortfolio._id,
      data: values,
    });
  };

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingPortfolio(null);
  };

  const handleModalSubmit = async (values) => {
    if (editingPortfolio) {
      await handleUpdate(values);
    } else {
      await handleCreate(values);
    }
  };

  if (isLoading) {
    return (
      <div className="portfolio-list-loading">
        <Loading size="lg" text="Portföyler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="portfolio-list-page">
      {/* Header */}
      <div className="portfolio-list-header">
        <div>
          <h1 className="portfolio-list-title">Portföylerim</h1>
          <p className="portfolio-list-subtitle">
            Tüm yatırım portföylerinizi tek yerden yönetin
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Yeni Portföy
        </Button>
      </div>

      {/* Portfolio Grid */}
      {portfolios.length === 0 ? (
        <EmptyState
          icon="📁"
          title="Henüz portföy yok"
          description="İlk portföyünüzü oluşturarak yatırımlarınızı takip etmeye başlayın"
          action={
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              İlk Portföyü Oluştur
            </Button>
          }
        />
      ) : (
        <div className="portfolio-grid">
          {portfolios.map((portfolio) => (
            <PortfolioCardWithSummary
              key={portfolio._id}
              portfolio={portfolio}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreatePortfolioModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingPortfolio}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};

/**
 * Wrapper component that fetches summary for each portfolio
 */
const PortfolioCardWithSummary = ({ portfolio, onEdit, onDelete }) => {
  const { data: summaryData, isLoading } = usePortfolioSummary(portfolio._id);
  const summary = summaryData?.data;

  return (
    <PortfolioCard
      portfolio={portfolio}
      summary={summary}
      loading={isLoading}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};

export default PortfolioList;

