// src/components/Common/Card/Card.jsx
import React from 'react';
import classNames from 'classnames';
import './Card.css';

/**
 * Card Component
 * @param {React.ReactNode} title - Kart başlığı
 * @param {React.ReactNode} extra - Sağ üst köşe içeriği
 * @param {boolean} hoverable - Hover efekti
 * @param {boolean} bordered - Kenarlık
 * @param {string} size - sm | md | lg
 */
const Card = ({
  children,
  title,
  extra,
  hoverable = false,
  bordered = true,
  size = 'md',
  className,
  style,
  onClick,
  ...props
}) => {
  const cardClass = classNames(
    'card',
    `card-${size}`,
    {
      'card-hoverable': hoverable,
      'card-bordered': bordered,
      'card-clickable': onClick,
    },
    className
  );

  return (
    <div className={cardClass} style={style} onClick={onClick} {...props}>
      {(title || extra) && (
        <div className="card-header">
          {title && <div className="card-title">{title}</div>}
          {extra && <div className="card-extra">{extra}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;

