import { useQuery } from '@tanstack/react-query';
import type { ReviewSort } from '../model';
import { fetchReviews } from '../api/products/productsApi';

// Issue 12: a failed request must surface, not be swallowed into an empty list like the original.
export const useReviewsQuery = (productId: string, sort: ReviewSort = 'newest') =>
  useQuery({
    queryKey: ['pdp', 'reviews', productId, sort],
    queryFn: ({ signal }) => fetchReviews(productId, sort, signal),
  });
