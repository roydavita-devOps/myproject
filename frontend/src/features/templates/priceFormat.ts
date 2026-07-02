export type PriceCurrency = 'IDR' | 'USD';

export type PricedItem = {
  price?: string | number | null;
  priceCurrency?: PriceCurrency | string | null;
};

export function formatMenuPrice(item: PricedItem) {
  if (item.price === undefined || item.price === null || item.price === '') return '';

  const value = Number(item.price);
  if (!Number.isFinite(value)) return '';

  const currency = item.priceCurrency === 'USD' ? 'USD' : 'IDR';
  if (currency === 'USD') {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
  }

  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function hasMenuPrice(item: PricedItem) {
  return formatMenuPrice(item) !== '';
}
