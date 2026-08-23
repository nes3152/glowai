import { enrichProduct, enrichProducts, fetchIngredientsText } from '../src/services/ingredientsService';

const PRODUCT = {
  id: 'cosrx-low-ph-cleanser',
  name: 'COSRX Low pH Good Morning Gel Cleanser',
  ingredients: ['bha'],
  openBeautyFactsCode: '8809416470511',
};

function respondWith(body, { ok = true } = {}) {
  return jest.fn().mockResolvedValue({ ok, json: async () => body });
}

describe('fetchIngredientsText', () => {
  it('returns the published ingredient list', async () => {
    const fetchImpl = respondWith({ product: { ingredients_text: '  Water, Glycerin  ' } });
    await expect(fetchIngredientsText('123', { fetchImpl })).resolves.toBe('Water, Glycerin');
    expect(fetchImpl.mock.calls[0][0]).toContain('/product/123.json');
  });

  it('skips the request entirely without a barcode', async () => {
    const fetchImpl = respondWith({});
    await expect(fetchIngredientsText(undefined, { fetchImpl })).resolves.toBeNull();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns null on a missing product', async () => {
    const fetchImpl = respondWith({ status: 0 }, { ok: false });
    await expect(fetchIngredientsText('123', { fetchImpl })).resolves.toBeNull();
  });

  it('returns null when the product exists but has no ingredients', async () => {
    const fetchImpl = respondWith({ product: { ingredients_text: '' } });
    await expect(fetchIngredientsText('123', { fetchImpl })).resolves.toBeNull();
  });

  it('swallows network errors', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('offline'));
    await expect(fetchIngredientsText('123', { fetchImpl })).resolves.toBeNull();
  });
});

describe('enrichProduct', () => {
  it('attaches the ingredient text and its source on a hit', async () => {
    const fetchImpl = respondWith({ product: { ingredients_text: 'Water, Glycerin' } });
    await expect(enrichProduct(PRODUCT, { fetchImpl })).resolves.toEqual({
      ...PRODUCT,
      ingredientSource: 'open-beauty-facts',
      ingredientsText: 'Water, Glycerin',
    });
  });

  it('keeps the catalog product intact on a miss', async () => {
    const fetchImpl = respondWith({ status: 0 }, { ok: false });
    const enriched = await enrichProduct(PRODUCT, { fetchImpl });
    expect(enriched).toEqual({ ...PRODUCT, ingredientSource: 'catalog' });
    expect(enriched.ingredients).toEqual(['bha']);
  });

  it('never mutates the input', async () => {
    const fetchImpl = respondWith({ product: { ingredients_text: 'Water' } });
    await enrichProduct(PRODUCT, { fetchImpl });
    expect(PRODUCT.ingredientsText).toBeUndefined();
  });
});

describe('enrichProducts', () => {
  it('resolves every product even when one lookup fails', async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ product: { ingredients_text: 'Water' } }) })
      .mockRejectedValueOnce(new Error('offline'));
    const enriched = await enrichProducts([PRODUCT, { ...PRODUCT, id: 'other' }], { fetchImpl });
    expect(enriched.map((product) => product.ingredientSource)).toEqual([
      'open-beauty-facts',
      'catalog',
    ]);
  });
});
