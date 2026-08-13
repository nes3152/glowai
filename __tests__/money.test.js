import { formatPrice, sumPrices } from '../src/domain/money';

describe('formatPrice', () => {
  it('renders known currencies with their symbol', () => {
    expect(formatPrice({ amount: 12, currency: 'USD' })).toBe('$12');
    expect(formatPrice({ amount: 29000, currency: 'KRW' })).toBe('₩29,000');
  });

  it('keeps two decimals for fractional amounts', () => {
    expect(formatPrice({ amount: 12.5, currency: 'USD' })).toBe('$12.50');
  });

  it('falls back to a currency code suffix for unknown currencies', () => {
    expect(formatPrice({ amount: 5, currency: 'JPY' })).toBe('5 JPY');
  });

  it.each([[null], [undefined], [{}], [{ amount: NaN, currency: 'USD' }], [{ amount: '12' }]])(
    'renders a placeholder for invalid input %p',
    (input) => {
      expect(formatPrice(input)).toBe('—');
    }
  );
});

describe('sumPrices', () => {
  it('adds up item prices', () => {
    expect(
      sumPrices([{ price: { amount: 12, currency: 'USD' } }, { price: { amount: 8, currency: 'USD' } }])
    ).toBe(20);
  });

  it('skips items without a price and returns 0 for an empty list', () => {
    expect(sumPrices([{ price: { amount: 12 } }, {}])).toBe(12);
    expect(sumPrices([])).toBe(0);
  });
});
