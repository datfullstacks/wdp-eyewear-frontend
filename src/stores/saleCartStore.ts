import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SaleCartItem } from '@/types/saleCheckout';

interface SaleCartState {
  items: SaleCartItem[];
  addToCart: (item: SaleCartItem) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

function itemKey(productId: string, variantId: string): string {
  return `${productId}::${variantId}`;
}

export const useSaleCartStore = create<SaleCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) =>
        set((state) => {
          const normalizedQty = Math.max(1, Math.floor(item.quantity || 1));
          const nextItem = { ...item, quantity: normalizedQty };
          const targetKey = itemKey(nextItem.productId, nextItem.variantId);

          const existing = state.items.find(
            (existingItem) =>
              itemKey(existingItem.productId, existingItem.variantId) === targetKey
          );

          if (!existing) {
            return { items: [...state.items, nextItem] };
          }

          return {
            items: state.items.map((current) => {
              const currentKey = itemKey(current.productId, current.variantId);
              if (currentKey !== targetKey) return current;

              const mergedQty = current.quantity + normalizedQty;
              const cappedQty = Math.max(1, Math.min(current.stock || mergedQty, mergedQty));

              return {
                ...current,
                quantity: cappedQty,
              };
            }),
          };
        }),

      removeFromCart: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => itemKey(item.productId, item.variantId) !== itemKey(productId, variantId)
          ),
        })),

      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (itemKey(item.productId, item.variantId) !== itemKey(productId, variantId)) {
              return item;
            }

            const normalizedQty = Math.max(1, Math.floor(quantity));
            const cappedQty = Math.max(1, Math.min(item.stock || normalizedQty, normalizedQty));
            return {
              ...item,
              quantity: cappedQty,
            };
          }),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'wdp-sale-cart',
    }
  )
);
