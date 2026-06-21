// Pure cart logic.

import type { CartItem } from './types';

// Issue 22: keep quantity in [1, stock], never NaN.
export const clampQuantity = (value: number, stock: number): number => {
  if (Number.isNaN(value)) return 1;
  return Math.min(Math.max(1, value), Math.max(1, stock));
};

// Issue 22: re-adding the same product increments its quantity instead of duplicating the line.
export const addItemToCart = (cart: CartItem[], item: CartItem): CartItem[] => {
  if (!cart.some((line) => line.productId === item.productId)) {
    return [...cart, item];
  }
  return cart.map((line) =>
    line.productId === item.productId ? { ...line, quantity: line.quantity + item.quantity } : line,
  );
};
