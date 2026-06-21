import { useQuery } from '@tanstack/react-query';
import { trackProductView } from '../api/products/productsApi';

// Issue 17: fires once — `enabled` waits for the product, staleTime:Infinity stops re-firing.
// No useEffect, no ref, no manual flag.
export const useProductViewTracking = (productId: string | undefined) =>
  useQuery({
    queryKey: ['pdp', 'product-view', productId],
    enabled: Boolean(productId),
    queryFn: ({ signal }) => trackProductView(productId!, signal),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
