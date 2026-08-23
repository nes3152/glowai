import { COSMETICS } from '../src/data/products';
import { buyLinks, RETAILERS, searchQuery } from '../src/domain/retailers';

describe('searchQuery', () => {
  it('prefixes the brand when the name does not already start with it', () => {
    expect(searchQuery({ brand: 'Anua', name: 'Heartleaf 77% Soothing Cream' })).toBe(
      'Anua Heartleaf 77% Soothing Cream',
    );
  });

  it('does not repeat a brand that is already part of the name', () => {
    expect(searchQuery({ brand: 'COSRX', name: 'COSRX Low pH Good Morning Gel Cleanser' })).toBe(
      'COSRX Low pH Good Morning Gel Cleanser',
    );
  });

  it('falls back to the name alone when there is no brand', () => {
    expect(searchQuery({ name: 'Mystery Cream' })).toBe('Mystery Cream');
  });
});

describe('buyLinks', () => {
  const product = {
    name: 'Anua Heartleaf 77% Soothing Cream',
    brand: 'Anua',
    retailers: ['amazon', 'oliveyoung'],
  };

  it('builds one link per configured retailer', () => {
    expect(buyLinks(product).map((link) => link.id)).toEqual(['amazon', 'oliveyoung']);
  });

  it('percent-encodes the query so % and spaces survive', () => {
    const [amazon, oliveYoung] = buyLinks(product);
    expect(amazon.url).toBe(
      'https://www.amazon.com/s?k=Anua%20Heartleaf%2077%25%20Soothing%20Cream',
    );
    expect(oliveYoung.url).toBe(
      'https://global.oliveyoung.com/global/search/results?query=Anua%20Heartleaf%2077%25%20Soothing%20Cream',
    );
  });

  it('defaults to Amazon when a product lists no retailers', () => {
    expect(buyLinks({ name: 'Some Cream' }).map((link) => link.id)).toEqual(['amazon']);
  });

  it('ignores retailer ids it does not know', () => {
    expect(buyLinks({ ...product, retailers: ['amazon', 'nowhere'] })).toHaveLength(1);
  });

  it('returns nothing when there is no searchable name', () => {
    expect(buyLinks({ brand: 'Anua' })).toEqual([]);
  });
});

describe('catalog buy links', () => {
  it('gives every cosmetic at least one https link', () => {
    COSMETICS.forEach((product) => {
      const links = buyLinks(product);
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => expect(link.url.startsWith('https://')).toBe(true));
    });
  });

  it('only references known retailers', () => {
    COSMETICS.forEach((product) => {
      (product.retailers ?? []).forEach((id) => expect(RETAILERS[id]).toBeDefined());
    });
  });
});
