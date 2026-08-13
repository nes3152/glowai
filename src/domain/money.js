const SYMBOLS = { USD: '$', KRW: '₩', EUR: '€' };

export function formatPrice(price) {
  if (!price || typeof price.amount !== 'number' || Number.isNaN(price.amount)) return '—';
  const symbol = SYMBOLS[price.currency] || '';
  const amount = Number.isInteger(price.amount)
    ? price.amount.toLocaleString('en-US')
    : price.amount.toFixed(2);
  return symbol ? `${symbol}${amount}` : `${amount} ${price.currency}`;
}

export function sumPrices(items) {
  return items.reduce((total, item) => total + (item.price?.amount ?? 0), 0);
}
