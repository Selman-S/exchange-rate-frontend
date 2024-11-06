export const formatTL = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value) + ' TL';
  };