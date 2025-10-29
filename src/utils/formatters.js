// src/utils/formatters.js
// Veri formatlama utility fonksiyonları

/**
 * TL formatı - Türk Lirası para formatı
 * @param {number} value - Formatlanacak sayı
 * @param {number} decimals - Ondalık basamak sayısı (varsayılan: 2)
 * @returns {string} - Formatlanmış TL değeri
 */
export const formatTL = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0,00 ₺';
  }

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Yüzde formatı
 * @param {number} value - Formatlanacak sayı
 * @param {number} decimals - Ondalık basamak sayısı (varsayılan: 2)
 * @param {boolean} showSign - + işareti göster mi? (varsayılan: true)
 * @returns {string} - Formatlanmış yüzde değeri
 */
export const formatPercent = (value, decimals = 2, showSign = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? '+' : '';
  
  return `${sign}${formatted}%`;
};

/**
 * Sayı formatı - Binlik ayraçlı
 * @param {number} value - Formatlanacak sayı
 * @param {number} decimals - Ondalık basamak sayısı (varsayılan: 0)
 * @returns {string} - Formatlanmış sayı
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Tarih formatı - Türkçe
 * @param {Date|string} date - Formatlanacak tarih
 * @param {string} format - Format tipi: 'short', 'medium', 'long', 'full' (varsayılan: 'medium')
 * @returns {string} - Formatlanmış tarih
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const formats = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' }, // 29.10.2025
    medium: { day: '2-digit', month: 'short', year: 'numeric' }, // 29 Eki 2025
    long: { day: '2-digit', month: 'long', year: 'numeric' }, // 29 Ekim 2025
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }, // Çarşamba, 29 Ekim 2025
  };

  return new Intl.DateTimeFormat('tr-TR', formats[format] || formats.medium).format(dateObj);
};

/**
 * Tarih + Saat formatı
 * @param {Date|string} date - Formatlanacak tarih
 * @returns {string} - Formatlanmış tarih ve saat
 */
export const formatDateTime = (date) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * ISO tarih formatı (YYYY-MM-DD)
 * @param {Date} date - Formatlanacak tarih
 * @returns {string} - ISO formatında tarih
 */
export const formatISO = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toISOString().split('T')[0];
};

/**
 * Göreli zaman formatı (örn: "2 saat önce")
 * @param {Date|string} date - Formatlanacak tarih
 * @returns {string} - Göreli zaman
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);

  if (diffInSeconds < 60) {
    return 'Az önce';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} dakika önce`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} saat önce`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} gün önce`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} hafta önce`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ay önce`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} yıl önce`;
};

/**
 * Kısa sayı formatı (örn: 1.2K, 3.5M)
 * @param {number} value - Formatlanacak sayı
 * @returns {string} - Kısa format
 */
export const formatCompactNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);
  
  if (absValue >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  }
  if (absValue >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (absValue >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  
  return value.toString();
};

/**
 * Birim ile sayı formatı (gram, adet, etc.)
 * @param {number} value - Sayı
 * @param {string} unit - Birim
 * @returns {string} - Formatlanmış değer
 */
export const formatWithUnit = (value, unit) => {
  if (value === null || value === undefined || isNaN(value)) {
    return `0 ${unit}`;
  }

  return `${formatNumber(value, 2)} ${unit}`;
};

export default {
  formatTL,
  formatPercent,
  formatNumber,
  formatDate,
  formatDateTime,
  formatISO,
  formatRelativeTime,
  formatCompactNumber,
  formatWithUnit,
};

