// src/components/Common/Button/Button.jsx
import React from 'react';
import classNames from 'classnames';
import './Button.css';

/**
 * Button Component
 * @param {string} variant - primary | secondary | danger | ghost | link
 * @param {string} size - sm | md | lg
 * @param {boolean} fullWidth - Tam genişlik
 * @param {boolean} loading - Yükleme durumu
 * @param {boolean} disabled - Devre dışı
 * @param {string} icon - İkon (sol)
 * @param {string} iconRight - İkon (sağ)
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconRight,
  className,
  onClick,
  type = 'button',
  ...props
}) => {
  const buttonClass = classNames(
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    {
      'btn-full-width': fullWidth,
      'btn-loading': loading,
      'btn-disabled': disabled || loading,
    },
    className
  );

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick && onClick(e);
  };

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="btn-spinner" />}
      {!loading && icon && <span className="btn-icon-left">{icon}</span>}
      {children && <span className="btn-content">{children}</span>}
      {!loading && iconRight && <span className="btn-icon-right">{iconRight}</span>}
    </button>
  );
};

export default Button;

