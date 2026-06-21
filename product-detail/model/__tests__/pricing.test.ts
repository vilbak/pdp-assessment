import { describe, expect, it } from 'vitest';
import { computeFinalPrice, getBasePrice } from '../pricing';
import type { Product } from '../types';

const product = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Item',
  sku: 'SKU1',
  description: '',
  price: 100,
  currency: 'USD',
  stock: 5,
  images: [],
  rating: 4,
  reviewCount: 0,
  category: 'cat',
  tags: [],
  ...overrides,
});

describe('getBasePrice', () => {
  it('uses salePrice when present', () => {
    expect(getBasePrice(product({ price: 100, salePrice: 80 }))).toBe(80);
  });

  it('keeps a salePrice of 0', () => {
    expect(getBasePrice(product({ price: 100, salePrice: 0 }))).toBe(0);
  });

  it('falls back to price when there is no salePrice', () => {
    expect(getBasePrice(product({ price: 100 }))).toBe(100);
  });
});

describe('computeFinalPrice', () => {
  it('returns the base price at zero discount', () => {
    expect(computeFinalPrice(product({ price: 100 }), 0)).toBe(100);
  });

  it('applies a fractional discount', () => {
    expect(computeFinalPrice(product({ price: 100 }), 0.1)).toBe(90);
  });

  it('is free at a full (1.0) discount', () => {
    expect(computeFinalPrice(product({ price: 100 }), 1)).toBe(0);
  });

  it('discounts the sale price, not the original', () => {
    expect(computeFinalPrice(product({ price: 100, salePrice: 80 }), 0.5)).toBe(40);
  });
});
