/**
 * Buy links are built as retailer *search* URLs rather than stored product URLs:
 * a deep link rots the moment a listing is delisted, and we have no affiliate
 * API to resolve a live lowest price. Nothing here promises a price — the price
 * shown in the app is the catalog price, not the retailer's.
 */
export const RETAILERS = {
  amazon: {
    id: 'amazon',
    label: 'Amazon',
    searchUrl: (query) => `https://www.amazon.com/s?k=${encodeURIComponent(query)}`,
  },
  oliveyoung: {
    id: 'oliveyoung',
    label: 'Olive Young',
    searchUrl: (query) =>
      `https://global.oliveyoung.com/global/search/results?query=${encodeURIComponent(query)}`,
  },
};

export const DEFAULT_RETAILERS = ['amazon'];

/** Brand + name, deduped so "The Ordinary The Ordinary Niacinamide" can't happen. */
export function searchQuery(product) {
  const name = (product?.name ?? '').trim();
  const brand = (product?.brand ?? '').trim();
  if (!name) return '';
  if (!brand || name.toLowerCase().startsWith(brand.toLowerCase())) return name;
  return `${brand} ${name}`.trim();
}

export function buyLinks(product) {
  const query = searchQuery(product);
  if (!query) return [];
  const ids = product.retailers?.length ? product.retailers : DEFAULT_RETAILERS;
  return ids
    .map((id) => RETAILERS[id])
    .filter(Boolean)
    .map((retailer) => ({
      id: retailer.id,
      label: retailer.label,
      url: retailer.searchUrl(query),
    }));
}
