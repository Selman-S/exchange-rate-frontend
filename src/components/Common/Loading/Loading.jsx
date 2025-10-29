// src/components/Common/Loading/Loading.jsx
import React from 'react';
import classNames from 'classnames';
import './Loading.css';

/**
 * Loading Component
 * @param {string} size - sm | md | lg
 * @param {boolean} fullScreen - Tam ekran overlay
 * @param {string} text - Yükleme metni
 */
const Loading = ({
  size = 'md',
  fullScreen = false,
  text,
  className
}) => {
  const spinnerClass = classNames(
    'loading-spinner',
    `loading-spinner-${size}`,
    className
  );

  const content = (
    <div className="loading-content">
      <div className={spinnerClass}>
        <div className="loading-spinner-ring"></div>
      </div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;

