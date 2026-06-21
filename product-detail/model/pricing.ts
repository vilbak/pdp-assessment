import type { Currency, Product } from './types';

// Issue 20: `??` not `||`, so a salePrice of 0 isn't ignored.
export const getBasePrice = (product: Product): number => product.salePrice ?? product.price;

// Issue 20: plain function — no useMemo.
export const computeFinalPrice = (product: Product, discount: number): number =>
  getBasePrice(product) * (1 - discount);

// Issue 27: one formatter; correct decimals per currency.
export const formatPrice = (amount: number, currency: Currency): string =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
