import { describe, expect, it } from 'vitest';
import { addRecentlyViewed } from '../recentlyViewed';
import type { ProductSummary } from '../types';

const summary = (id: string): ProductSummary => ({
  id,
  name: id,
  price: 10,
  currency: 'USD',
  images: [],
});

describe('addRecentlyViewed', () => {
  it('prepends the product', () => {
    const result = addRecentlyViewed([summary('b')], summary('a'));
    expect(result.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('moves a re-viewed product to the front without duplicating', () => {
    const result = addRecentlyViewed([summary('b'), summary('a'), summary('c')], summary('a'));
    expect(result.map((p) => p.id)).toEqual(['a', 'b', 'c']);
  });

  it('caps the list and drops the oldest', () => {
    const list = ['b', 'c', 'd', 'e', 'f'].map(summary);
    const result = addRecentlyViewed(list, summary('a'), 5);
    expect(result).toHaveLength(5);
    expect(result.map((p) => p.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });
});
