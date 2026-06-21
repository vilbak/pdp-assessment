import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addRecentlyViewed, type ProductSummary } from '../model';

type RecentlyViewedState = {
  items: ProductSummary[];
  track: (product: ProductSummary) => void;
};

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      // Issue 14: an action + pure transform, not a self-updating effect (the original looped).
      track: (product) =>
        set((state) => ({ items: addRecentlyViewed(state.items, product) })),
    }),
    { name: 'pdp.recentlyViewed' },
  ),
);
