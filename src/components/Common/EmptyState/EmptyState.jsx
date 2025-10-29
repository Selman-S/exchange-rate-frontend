// src/components/Common/EmptyState/EmptyState.jsx
import React from 'react';
import classNames from 'classnames';
import './EmptyState.css';

/**
 * EmptyState Component
 * @param {string} title - Başlık
 * @param {string} description - Açıklama metni
 * @param {React.ReactNode} icon - İkon veya görsel
 * @param {React.ReactNode} action - CTA butonu veya aksiyonlar
 */
const EmptyState = ({
  title,
  description,
  icon,
  action,
  className
}) => {
  const emptyStateClass = classNames('empty-state', className);

  return (
    <div className={emptyStateClass}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <div className="empty-state-title">{title}</div>}
      {description && <div className="empty-state-description">{description}</div>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};

export default EmptyState;

