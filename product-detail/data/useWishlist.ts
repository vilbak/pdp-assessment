import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWishlistStatus, setWishlist } from '../api/products/productsApi';

// Issue 23: status comes from the server and re-syncs after toggle (original toggled optimistically, no rollback).
export const useWishlist = (productId: string) => {
  const queryClient = useQueryClient();
  const key = ['pdp', 'wishlist', productId];

  const status = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => fetchWishlistStatus(productId, signal),
  });

  const toggle = useMutation({
    mutationFn: (next: boolean) => setWishlist(productId, next),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return {
    isWishlisted: Boolean(status.data),
    isLoading: status.isLoading,
    isToggling: toggle.isPending,
    toggle: () => toggle.mutate(!status.data),
  };
};
