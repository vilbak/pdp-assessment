import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '../api/products/productsApi';

// Issue 11: key is productId only — editing quantity must not refetch the product; signal cancels the race.
export const useProductQuery = (productId: string) =>
  useQuery({
    queryKey: ['pdp', 'product', productId],
    queryFn: ({ signal }) => fetchProduct(productId, signal),
  });
