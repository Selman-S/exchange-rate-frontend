// src/utils/exporters.js
import * as XLSX from 'xlsx';
import { formatTL, formatDate, formatDateTime, formatPercent } from './formatters';

/**
 * CSV Export Helper - Veriyi CSV formatına çevirir
 * @param {Array} data - Export edilecek veri
 * @param {Array} headers - CSV başlıkları
 * @returns {string} CSV string
 */
export const convertToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';

  // Header satırı
  const headerRow = headers.map(h => h.label).join(',');
  
  // Data satırları
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header.key];
      // Virgül içeren değerleri tırnak içine al
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value || '';
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download helper - Dosyayı kullanıcıya indirir
 * @param {string} content - Dosya içeriği
 * @param {string} filename - Dosya adı
 * @param {string} mimeType - MIME type
 */
export const downloadFile = (content, filename, mimeType = 'text/csv') => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Varlık listesini CSV olarak export eder
 * @param {Array} assets - Varlık listesi
 * @param {Object} currentPrices - Güncel fiyat map'i
 * @param {string} portfolioName - Portföy adı
 */
export const exportAssetsToCSV = (assets, currentPrices, portfolioName) => {
  const headers = [
    { key: 'name', label: 'Varlık Adı' },
    { key: 'type', label: 'Tür' },
    { key: 'amount', label: 'Miktar' },
    { key: 'costPrice', label: 'Maliyet Fiyatı (₺)' },
    { key: 'currentPrice', label: 'Güncel Fiyat (₺)' },
    { key: 'totalCost', label: 'Toplam Maliyet (₺)' },
    { key: 'currentValue', label: 'Güncel Değer (₺)' },
    { key: 'pnl', label: 'Kar/Zarar (₺)' },
    { key: 'pnlPercent', label: 'Kar/Zarar (%)' },
    { key: 'portfolioShare', label: 'Portföy Payı (%)' },
    { key: 'purchaseDate', label: 'Alış Tarihi' },
  ];

  // Toplam değeri hesapla
  let totalValue = 0;
  assets.forEach(asset => {
    const currentRate = currentPrices[`${asset.type}-${asset.name}`];
    const currentPrice = currentRate?.buyPrice || asset.costPrice;
    totalValue += asset.amount * currentPrice;
  });

  const data = assets.map(asset => {
    const currentRate = currentPrices[`${asset.type}-${asset.name}`];
    const currentPrice = currentRate?.buyPrice || asset.costPrice;
    const totalCost = asset.amount * asset.costPrice;
    const currentValue = asset.amount * currentPrice;
    const pnl = currentValue - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    const portfolioShare = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

    return {
      name: asset.name,
      type: asset.type === 'gold' ? 'Altın' : 'Döviz',
      amount: asset.amount.toFixed(6),
      costPrice: asset.costPrice.toFixed(2),
      currentPrice: currentPrice.toFixed(2),
      totalCost: totalCost.toFixed(2),
      currentValue: currentValue.toFixed(2),
      pnl: pnl.toFixed(2),
      pnlPercent: pnlPercent.toFixed(2),
      portfolioShare: portfolioShare.toFixed(2),
      purchaseDate: formatDate(asset.purchaseDate),
    };
  });

  const csv = convertToCSV(data, headers);
  const filename = `${portfolioName}_Varliklar_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * İşlem geçmişini CSV olarak export eder
 * @param {Array} transactions - İşlem listesi
 * @param {string} portfolioName - Portföy adı
 */
export const exportTransactionsToCSV = (transactions, portfolioName) => {
  const headers = [
    { key: 'date', label: 'Tarih' },
    { key: 'side', label: 'İşlem Türü' },
    { key: 'assetName', label: 'Varlık' },
    { key: 'assetType', label: 'Tür' },
    { key: 'amount', label: 'Miktar' },
    { key: 'price', label: 'Fiyat (₺)' },
    { key: 'totalValue', label: 'Toplam (₺)' },
    { key: 'priceMode', label: 'Fiyat Modu' },
    { key: 'note', label: 'Not' },
    { key: 'createdAt', label: 'Oluşturulma' },
  ];

  const data = transactions.map(tx => ({
    date: formatDate(tx.date),
    side: tx.side === 'BUY' ? 'Alış' : 'Satış',
    assetName: tx.assetName,
    assetType: tx.assetType === 'gold' ? 'Altın' : 'Döviz',
    amount: tx.amount.toFixed(6),
    price: tx.price.toFixed(2),
    totalValue: tx.totalValue.toFixed(2),
    priceMode: tx.priceMode === 'AUTO' ? 'Otomatik' : 'Manuel',
    note: tx.note || '',
    createdAt: formatDateTime(tx.createdAt),
  }));

  const csv = convertToCSV(data, headers);
  const filename = `${portfolioName}_Islemler_${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
};

/**
 * Varlık listesini Excel olarak export eder
 * @param {Array} assets - Varlık listesi
 * @param {Object} currentPrices - Güncel fiyat map'i
 * @param {string} portfolioName - Portföy adı
 */
export const exportAssetsToExcel = (assets, currentPrices, portfolioName) => {
  // Toplam değeri hesapla
  let totalValue = 0;
  let totalCost = 0;

  assets.forEach(asset => {
    const currentRate = currentPrices[`${asset.type}-${asset.name}`];
    const currentPrice = currentRate?.buyPrice || asset.costPrice;
    totalValue += asset.amount * currentPrice;
    totalCost += asset.amount * asset.costPrice;
  });

  const data = assets.map(asset => {
    const currentRate = currentPrices[`${asset.type}-${asset.name}`];
    const currentPrice = currentRate?.buyPrice || asset.costPrice;
    const assetTotalCost = asset.amount * asset.costPrice;
    const currentValue = asset.amount * currentPrice;
    const pnl = currentValue - assetTotalCost;
    const pnlPercent = assetTotalCost > 0 ? (pnl / assetTotalCost) * 100 : 0;
    const portfolioShare = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

    return {
      'Varlık Adı': asset.name,
      'Tür': asset.type === 'gold' ? 'Altın' : 'Döviz',
      'Miktar': parseFloat(asset.amount.toFixed(6)),
      'Maliyet Fiyatı (₺)': parseFloat(asset.costPrice.toFixed(2)),
      'Güncel Fiyat (₺)': parseFloat(currentPrice.toFixed(2)),
      'Toplam Maliyet (₺)': parseFloat(assetTotalCost.toFixed(2)),
      'Güncel Değer (₺)': parseFloat(currentValue.toFixed(2)),
      'Kar/Zarar (₺)': parseFloat(pnl.toFixed(2)),
      'Kar/Zarar (%)': parseFloat(pnlPercent.toFixed(2)),
      'Portföy Payı (%)': parseFloat(portfolioShare.toFixed(2)),
      'Alış Tarihi': formatDate(asset.purchaseDate),
      'Portföye Eklenme': formatDate(asset.createdAt),
    };
  });

  // Özet satırı ekle
  const summary = {
    'Varlık Adı': 'TOPLAM',
    'Tür': '',
    'Miktar': '',
    'Maliyet Fiyatı (₺)': '',
    'Güncel Fiyat (₺)': '',
    'Toplam Maliyet (₺)': parseFloat(totalCost.toFixed(2)),
    'Güncel Değer (₺)': parseFloat(totalValue.toFixed(2)),
    'Kar/Zarar (₺)': parseFloat((totalValue - totalCost).toFixed(2)),
    'Kar/Zarar (%)': totalCost > 0 ? parseFloat((((totalValue - totalCost) / totalCost) * 100).toFixed(2)) : 0,
    'Portföy Payı (%)': 100,
    'Alış Tarihi': '',
    'Portföye Eklenme': '',
  };

  data.push(summary);

  // Excel workbook oluştur
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Varlıklar');

  // Column width ayarla
  ws['!cols'] = [
    { wch: 20 }, // Varlık Adı
    { wch: 10 }, // Tür
    { wch: 12 }, // Miktar
    { wch: 15 }, // Maliyet Fiyatı
    { wch: 15 }, // Güncel Fiyat
    { wch: 15 }, // Toplam Maliyet
    { wch: 15 }, // Güncel Değer
    { wch: 15 }, // Kar/Zarar (₺)
    { wch: 15 }, // Kar/Zarar (%)
    { wch: 15 }, // Portföy Payı
    { wch: 12 }, // Alış Tarihi
    { wch: 15 }, // Portföye Eklenme
  ];

  const filename = `${portfolioName}_Varliklar_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};

/**
 * İşlem geçmişini Excel olarak export eder
 * @param {Array} transactions - İşlem listesi
 * @param {string} portfolioName - Portföy adı
 */
export const exportTransactionsToExcel = (transactions, portfolioName) => {
  const data = transactions.map(tx => ({
    'Tarih': formatDate(tx.date),
    'İşlem Türü': tx.side === 'BUY' ? 'Alış' : 'Satış',
    'Varlık': tx.assetName,
    'Tür': tx.assetType === 'gold' ? 'Altın' : 'Döviz',
    'Miktar': parseFloat(tx.amount.toFixed(6)),
    'Fiyat (₺)': parseFloat(tx.price.toFixed(2)),
    'Toplam (₺)': parseFloat(tx.totalValue.toFixed(2)),
    'Fiyat Modu': tx.priceMode === 'AUTO' ? 'Otomatik' : 'Manuel',
    'Not': tx.note || '',
    'Oluşturulma': formatDateTime(tx.createdAt),
  }));

  // Özet hesapla
  const totalBuy = transactions
    .filter(tx => tx.side === 'BUY')
    .reduce((sum, tx) => sum + tx.totalValue, 0);
  const totalSell = transactions
    .filter(tx => tx.side === 'SELL')
    .reduce((sum, tx) => sum + tx.totalValue, 0);

  // Özet satırları ekle
  data.push({});
  data.push({
    'Tarih': 'ÖZET',
    'İşlem Türü': '',
    'Varlık': '',
    'Tür': '',
    'Miktar': '',
    'Fiyat (₺)': '',
    'Toplam (₺)': '',
    'Fiyat Modu': '',
    'Not': '',
    'Oluşturulma': '',
  });
  data.push({
    'Tarih': 'Toplam Alış',
    'İşlem Türü': '',
    'Varlık': '',
    'Tür': '',
    'Miktar': '',
    'Fiyat (₺)': '',
    'Toplam (₺)': parseFloat(totalBuy.toFixed(2)),
    'Fiyat Modu': '',
    'Not': '',
    'Oluşturulma': '',
  });
  data.push({
    'Tarih': 'Toplam Satış',
    'İşlem Türü': '',
    'Varlık': '',
    'Tür': '',
    'Miktar': '',
    'Fiyat (₺)': '',
    'Toplam (₺)': parseFloat(totalSell.toFixed(2)),
    'Fiyat Modu': '',
    'Not': '',
    'Oluşturulma': '',
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'İşlemler');

  // Column width
  ws['!cols'] = [
    { wch: 12 }, // Tarih
    { wch: 12 }, // İşlem Türü
    { wch: 20 }, // Varlık
    { wch: 10 }, // Tür
    { wch: 12 }, // Miktar
    { wch: 12 }, // Fiyat
    { wch: 12 }, // Toplam
    { wch: 12 }, // Fiyat Modu
    { wch: 30 }, // Not
    { wch: 18 }, // Oluşturulma
  ];

  const filename = `${portfolioName}_Islemler_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};

