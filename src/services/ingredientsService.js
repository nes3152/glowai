/**
 * Optional Open Beauty Facts enrichment.
 *
 * OBF only covers 2 of the catalog's 11 products today (most K-beauty items are
 * missing), so it is never allowed to influence which products get recommended:
 * matching still runs on the catalog's own `ingredients` tags. This layer only
 * attaches the full published INCI list when a barcode happens to be known, and
 * any failure (offline, 404, empty field) leaves the product untouched.
 */
const API_BASE = 'https://world.openbeautyfacts.org/api/v2/product';
const USER_AGENT = 'GlowAI - Web - Version 1.0 - https://nes3152.github.io/glowai/';
const TIMEOUT_MS = 4000;

export async function fetchIngredientsText(code, { fetchImpl = fetch, timeoutMs = TIMEOUT_MS } = {}) {
  if (!code) return null;
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetchImpl(
      `${API_BASE}/${encodeURIComponent(code)}.json?fields=code,ingredients_text`,
      { headers: { 'User-Agent': USER_AGENT }, signal: controller?.signal },
    );
    if (!response.ok) return null;
    const body = await response.json();
    const text = body?.product?.ingredients_text;
    return typeof text === 'string' && text.trim() ? text.trim() : null;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Returns a copy of the product; `ingredientSource` says where the list came from. */
export async function enrichProduct(product, options = {}) {
  const text = await fetchIngredientsText(product.openBeautyFactsCode, options);
  if (!text) return { ...product, ingredientSource: 'catalog' };
  return { ...product, ingredientSource: 'open-beauty-facts', ingredientsText: text };
}

export async function enrichProducts(products, options = {}) {
  return Promise.all(products.map((product) => enrichProduct(product, options)));
}
