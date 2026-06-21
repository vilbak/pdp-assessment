import { useQuery } from '@tanstack/react-query';
import { fetchRecommendations } from '../api/products/productsApi';

// Issue 13: original ran on the whole product object and fired a useless category=undefined request.
export const useRecommendationsQuery = (productId: string, category?: string) =>
  useQuery({
    queryKey: ['pdp', 'recommendations', productId, category],
    enabled: Boolean(category),
    queryFn: ({ signal }) => fetchRecommendations(productId, category!, signal),
  });
