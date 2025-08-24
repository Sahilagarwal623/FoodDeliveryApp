import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type MenuItem = {
    id: number;
    name: string;
    price: number;
};

export type CartItem = MenuItem & {
    quantity: number;
};

type CartState = {
    items: Record<number, CartItem>;
    isInitialized: boolean;
    initializeCart: () => Promise<void>;
    addItem: (item: MenuItem) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    getTotalItems: () => number,
    getCartTotal: () => number,
};

export const useCartStore = create<CartState>()(
    immer((set, get) => ({
        items: {},
        isInitialized: false,

        initializeCart: async () => {
            try {
                const response = await fetch('/api/cart', { credentials: 'include' });
                if (response.ok) {
                    const serverItems: CartItem[] = await response.json();

                    const itemsAsObject = serverItems.reduce((acc, item) => {
                        acc[item.id] = item;
                        return acc;
                    }, {} as Record<number, CartItem>);

                    set({ items: itemsAsObject, isInitialized: true });
                } else {
                    set({ isInitialized: true });
                }
            } catch (error) {
                console.error("Failed to initialize cart:", error);
                set({ isInitialized: true });
            }
        },

        addItem: async (item) => {
            set((state) => {
                const existingItem = state.items[item.id];
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    state.items[item.id] = { ...item, quantity: 1 };
                }
            });
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ menuItemId: item.id, quantity: 1 }),
                credentials: 'include',
            });
        },

        removeItem: async (itemId) => {
            set((state) => {
                const item = state.items[itemId];
                if (item && item.quantity > 1) {
                    item.quantity--;
                } else {
                    delete state.items[itemId];
                }
            });
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ menuItemId: itemId, quantity: -1 }),
                credentials: 'include',
            });
        },

        getTotalItems: () => {
            const items = Object.values(get().items);
            return items.reduce((total, item) => total + item.quantity, 0);
        },

        getCartTotal: () => {
            const items = Object.values(get().items);
            return items.reduce((total, item) => total + item.price * item.quantity, 0);
        },

    }))
);
