import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SaleCartItem } from '@/types/saleCheckout';

interface SaleCartState {
  items: SaleCartItem[];
  addToCart: (item: SaleCartItem) => void;
  replaceItems: (items: SaleCartItem[]) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

function itemKey(productId: string, variantId: string): string {
  return `${productId}::${variantId}`;
}

function capQuantity(quantity: number, stock?: number): number {
  const normalizedQty = Math.max(1, Math.floor(quantity || 1));
  const normalizedStock = Number(stock);

  if (Number.isFinite(normalizedStock) && normalizedStock > 0) {
    return Math.min(normalizedQty, Math.floor(normalizedStock));
  }

  return normalizedQty;
}

export const useSaleCartStore = create<SaleCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) =>
        set((state) => {
          const normalizedQty = capQuantity(item.quantity, item.stock);
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

              return {
                ...current,
                ...nextItem,
                quantity: capQuantity(current.quantity + normalizedQty, nextItem.stock),
              };
            }),
          };
        }),

      replaceItems: (items) =>
        set({
          items: items.map((item) => ({
            ...item,
            quantity: capQuantity(item.quantity, item.stock),
          })),
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

            return {
              ...item,
              quantity: capQuantity(quantity, item.stock),
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
