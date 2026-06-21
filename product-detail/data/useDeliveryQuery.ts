import { useQuery } from '@tanstack/react-query';
import { estimateDelivery } from '../api/products/productsApi';

// Issue 18: correct GET via the api client; fetched on demand (refetch), not per keystroke.
export const useDeliveryQuery = (productId: string, postcode: string) =>
  useQuery({
    queryKey: ['pdp', 'delivery', productId, postcode],
    queryFn: ({ signal }) => estimateDelivery(postcode, productId, signal),
    enabled: false,
  });
