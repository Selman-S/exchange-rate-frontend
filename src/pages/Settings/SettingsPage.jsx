// src/pages/Settings/SettingsPage.jsx
import React from 'react';
import { Card, Radio, Divider, Space } from 'antd';
import { 
  SunOutlined, 
  MoonOutlined, 
  SettingOutlined,
  BgColorsOutlined 
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const { theme, setLightTheme, setDarkTheme } = useTheme();

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    if (newTheme === 'light') {
      setLightTheme();
    } else {
      setDarkTheme();
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="page-title">Ayarlar</h1>
        <p className="page-description">Uygulama tercihlerinizi yönetin</p>
      </div>

      <div className="settings-content">
        {/* Görünüm Ayarları */}
        <Card
          title={
            <span>
              <BgColorsOutlined /> Görünüm
            </span>
          }
          className="settings-card"
        >
          <div className="setting-item">
            <div className="setting-info">
              <h3 className="setting-title">Tema</h3>
              <p className="setting-description">
                Uygulamanın görünümünü değiştirin
              </p>
            </div>
            
            <Radio.Group 
              value={theme} 
              onChange={handleThemeChange}
              className="theme-selector"
            >
              <Space direction="vertical" size="middle">
                <Radio value="light" className="theme-option">
                  <div className="theme-option-content">
                    <div className="theme-icon light-icon">
                      <SunOutlined />
                    </div>
                    <div className="theme-details">
                      <div className="theme-name">Açık Tema</div>
                      <div className="theme-desc">Günün her saati için uygun</div>
                    </div>
                  </div>
                </Radio>
                
                <Radio value="dark" className="theme-option">
                  <div className="theme-option-content">
                    <div className="theme-icon dark-icon">
                      <MoonOutlined />
                    </div>
                    <div className="theme-details">
                      <div className="theme-name">Koyu Tema</div>
                      <div className="theme-desc">Gözleriniz için daha rahat</div>
                    </div>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
          </div>
        </Card>

        {/* Bilgilendirme */}
        <Card className="settings-card info-card">
          <div className="info-content">
            <SettingOutlined className="info-icon" />
            <div className="info-text">
              <h4>Daha fazla ayar yakında!</h4>
              <p>
                Bildirim tercihleri, dil seçimi ve diğer özelleştirme 
                seçenekleri üzerinde çalışıyoruz.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;

