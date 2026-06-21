import { describe, expect, it } from 'vitest';
import { addItemToCart, clampQuantity } from '../cart';
import type { CartItem } from '../types';

const line = (productId: string, quantity: number): CartItem => ({
  productId,
  quantity,
  selectedImageUrl: 'img.jpg',
});

describe('clampQuantity', () => {
  it('floors at 1 for NaN, zero and negatives', () => {
    expect(clampQuantity(Number.NaN, 10)).toBe(1);
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(-3, 10)).toBe(1);
  });

  it('caps at stock', () => {
    expect(clampQuantity(7, 5)).toBe(5);
  });

  it('keeps a valid in-range quantity', () => {
    expect(clampQuantity(3, 5)).toBe(3);
  });

  it('never returns 0 when out of stock', () => {
    expect(clampQuantity(2, 0)).toBe(1);
  });
});

describe('addItemToCart', () => {
  it('adds a new product to an empty cart', () => {
    expect(addItemToCart([], line('a', 1))).toEqual([line('a', 1)]);
  });

  it('merges quantity for an existing product (no duplicate line)', () => {
    const result = addItemToCart([line('a', 2)], line('a', 3));
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(5);
  });

  it('appends a different product as a new line', () => {
    const result = addItemToCart([line('a', 2)], line('b', 1));
    expect(result.map((l) => l.productId)).toEqual(['a', 'b']);
  });

  it('does not mutate the input cart', () => {
    const cart = [line('a', 2)];
    addItemToCart(cart, line('a', 1));
    expect(cart[0].quantity).toBe(2);
  });
});
