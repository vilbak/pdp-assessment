import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addItemToCart, type CartItem } from '../model';

type CartState = {
  items: CartItem[];
  add: (item: CartItem) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) => set((state) => ({ items: addItemToCart(state.items, item) })), // Issue 22: merge by id
    }),
    { name: 'pdp.cart' }, // Issue 15/16: persist, instead of the original's manual localStorage
  ),
);
