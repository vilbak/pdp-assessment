import { useEffect, useState } from 'react';
import { useCouponMutation, useProductQuery, useProductViewTracking, useWishlist } from '../data';
import { useCartStore, useRecentlyViewedStore } from '../store';
import { clampQuantity } from '../model';

export const useProductDetailScreen = (productId: string) => {
  // Issue 9: most of the original's ~20 useState are gone — only a few real UI states stay here.
  // ── Server data ──
  const product = useProductQuery(productId);
  const wishlist = useWishlist(productId);
  const couponMutation = useCouponMutation();
  useProductViewTracking(product.data?.id); // Issue 17: fires once when the product is known

  // ── Stores ──
  const addItem = useCartStore((s) => s.add);
  const trackRecentlyViewed = useRecentlyViewedStore((s) => s.track);

  // ── UI state ──
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');

  // Issue 14: track on product load via a store action, not a self-updating effect.
  useEffect(() => {
    if (product.data) trackRecentlyViewed(product.data);
  }, [product.data?.id]);

  // ── Derived ──
  const discount = couponMutation.data?.valid ? couponMutation.data.discount : 0;
  const activeImage = selectedImage || product.data?.images[0] || '';
  const canAddToCart = Boolean(product.data && product.data.stock > 0);

  // ── Handlers ──
  const setQuantitySafe = (value: number) =>
    setQuantity(clampQuantity(value, product.data?.stock ?? 1));

  const applyCoupon = () => couponMutation.mutate(couponCode);

  const addToCart = () => {
    if (!product.data) return;
    addItem({ productId: product.data.id, quantity, selectedImageUrl: activeImage });
  };

  return {
    // ── Data ──
    product: {
      data: product.data,
      isLoading: product.isLoading,
      isError: product.isError,
      refetch: product.refetch, // Issue 25: error retry = refetch, not a page reload
    },
    // ── Gallery ──
    gallery: {
      images: product.data?.images ?? [],
      selected: activeImage,
      select: setSelectedImage,
    },
    // ── Pricing / quantity ──
    discount,
    quantity: { value: quantity, set: setQuantitySafe },
    // ── Coupon ──
    coupon: {
      code: couponCode,
      setCode: setCouponCode,
      apply: applyCoupon,
      message: couponMutation.data?.message ?? '',
      isApplying: couponMutation.isPending,
    },
    // ── Cart / wishlist ──
    canAddToCart,
    addToCart,
    wishlist,
  };
};
