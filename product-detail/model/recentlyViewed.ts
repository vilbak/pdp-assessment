import type { ProductSummary } from './types';

export const addRecentlyViewed = (
  list: ProductSummary[],
  product: ProductSummary,
  cap = 5,
): ProductSummary[] => [product, ...list.filter((p) => p.id !== product.id)].slice(0, cap);
