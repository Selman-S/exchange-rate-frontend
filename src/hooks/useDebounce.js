// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Debounce hook - Değer değişimini geciktirir
 * @param {any} value - Debounce edilecek değer
 * @param {number} delay - Gecikme süresi (ms)
 * @returns {any} - Debounce edilmiş değer
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;

