export const formatCurrency = (amount: number, options?: { currency?: string }) => {
  const currency = options?.currency ?? 'GHS';
  if (!Number.isFinite(amount)) {
    return `${currency} 0`;
  }

  return `${currency} ${amount
    .toLocaleString('en-US', {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;
};

export const formatDateTime = (value?: string | Date | null, locales: string | string[] = 'en-GB') => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString(locales, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
