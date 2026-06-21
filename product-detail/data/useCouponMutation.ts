import { useMutation } from '@tanstack/react-query';
import { validateCoupon } from '../api/products/productsApi';

// Issue 21: validity + discount come from the server, not hardcoded on the client (original's WELCOME10 = 100% off).
export const useCouponMutation = () =>
  useMutation({ mutationFn: (code: string) => validateCoupon(code) });
