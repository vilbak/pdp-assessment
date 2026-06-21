import { useQuery } from '@tanstack/react-query';
import { estimateDelivery } from '../api/products/productsApi';

// Issue 18: original used an invalid `GETTER` method instead of GET.
export const useDeliveryQuery = (productId: string, postcode: string) =>
  useQuery({
    queryKey: ['pdp', 'delivery', productId, postcode],
    enabled: Boolean(postcode),
    queryFn: ({ signal }) => estimateDelivery(postcode, productId, signal),
  });
