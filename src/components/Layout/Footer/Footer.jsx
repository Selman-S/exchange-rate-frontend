// src/components/Layout/Footer/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-logo">💱 Exchange Rate</span>
          <span className="footer-copyright">
            © {currentYear} Tüm hakları saklıdır.
          </span>
        </div>

        <div className="footer-links">
          <Link to="/about" className="footer-link">
            Hakkında
          </Link>
          <Link to="/privacy" className="footer-link">
            Gizlilik
          </Link>
          <Link to="/terms" className="footer-link">
            Şartlar
          </Link>
          <Link to="/contact" className="footer-link">
            İletişim
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;

