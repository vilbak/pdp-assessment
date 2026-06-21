import type {
  CouponResult,
  DeliveryEstimate,
  Product,
  Recommendation,
  Review,
  ReviewSort,
} from '../../model';
import { request } from '../core/httpClient';

export const fetchProduct = (productId: string, signal?: AbortSignal): Promise<Product> =>
  request<Product>(`/products/${productId}`, { signal });

export const fetchReviews = (
  productId: string,
  sort: ReviewSort,
  signal?: AbortSignal,
): Promise<Review[]> =>
  request<Review[]>(`/products/${productId}/reviews?sort=${sort}`, { signal });

export const fetchRecommendations = (
  productId: string,
  category: string,
  signal?: AbortSignal,
): Promise<Recommendation[]> =>
  request<Recommendation[]>(
    `/recommendations?productId=${productId}&category=${category}`,
    { signal },
  );

export const estimateDelivery = (
  postcode: string,
  productId: string,
  signal?: AbortSignal,
): Promise<DeliveryEstimate> =>
  request<DeliveryEstimate>(
    `/delivery/estimate?postcode=${encodeURIComponent(postcode)}&productId=${productId}`,
    { signal },
  );

export const validateCoupon = (code: string, signal?: AbortSignal): Promise<CouponResult> =>
  request<CouponResult>('/coupons/validate', { method: 'POST', body: { code }, signal });

export const fetchWishlistStatus = (
  productId: string,
  signal?: AbortSignal,
): Promise<boolean> =>
  request<{ wishlisted: boolean }>(`/wishlist/${productId}`, { signal }).then(
    (res) => res.wishlisted,
  );

export const setWishlist = (
  productId: string,
  wishlisted: boolean,
  signal?: AbortSignal,
): Promise<void> =>
  request<void>('/wishlist', {
    method: wishlisted ? 'POST' : 'DELETE',
    body: { productId },
    signal,
  });

export const trackProductView = (productId: string, signal?: AbortSignal): Promise<void> =>
  request<void>('/analytics/product-view', { method: 'POST', body: { productId }, signal });
