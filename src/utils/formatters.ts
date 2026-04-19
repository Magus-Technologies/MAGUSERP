export const formatCurrency = (value: number | null | undefined, symbol = 'S/'): string => {
  const n = Number(value);
  return `${symbol} ${(isNaN(n) ? 0 : n).toFixed(2)}`;
};

export const formatDate = (iso: string, locale = 'es-PE'): string =>
  new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatDateTime = (iso: string, locale = 'es-PE'): string =>
  new Date(iso).toLocaleString(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const formatNumber = (value: number): string =>
  value.toLocaleString('es-PE');

export const formatPercentage = (value: number | null | undefined): string => {
  const n = Number(value);
  return `${(isNaN(n) ? 0 : n).toFixed(2)}%`;
};
