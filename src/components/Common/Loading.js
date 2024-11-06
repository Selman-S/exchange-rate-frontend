// src/components/Common/Loading.js

import React from 'react';
import { Spin, Typography } from 'antd';

const { Text } = Typography;

/**
 * Loading Bileşeni
 *
 * @param {Object} props
 * @param {boolean} props.fullScreen - Yükleme göstergesinin tam ekran olup olmayacağını belirler.
 * @param {string} props.message - Yükleme sırasında gösterilecek mesaj.
 * @param {React.ReactNode} props.children - Yükleme sırasında gösterilecek çocuk bileşenler.
 * @param {string} props.size - Spin bileşeninin boyutu. ('small', 'default', 'large')
 * @returns {JSX.Element}
 */
const Loading = ({ fullScreen = false, message = 'Yükleniyor...', children, size = 'large' }) => {
  if (fullScreen) {
    return (
      <div style={styles.fullScreen}>
        <Spin size={size} tip={message} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Spin size={size} />
      {message && <Text style={{ marginLeft: 10 }}>{message}</Text>}
      {children}
    </div>
  );
};

const styles = {
  fullScreen: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999,
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
};

export default Loading;
