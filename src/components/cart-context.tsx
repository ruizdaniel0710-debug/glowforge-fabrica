import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";

type CartLine = { 
  product: Product; 
  quantity: number;
  color?: string | null;
  size?: string | null;
  files?: { name: string; path: string; size: number }[];
};
type CartContextValue = {
  items: CartLine[];
  isOpen: boolean;
  totalItems: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number, options?: { color?: string | null, size?: string | null, files?: { name: string; path: string; size: number }[] }) => void;
  changeQuantity: (index: number, change: number) => void;
  removeItem: (index: number) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo<CartContextValue>(() => ({
    items,
    isOpen,
    totalItems: items.reduce((total, item) => total + item.quantity, 0),
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
    addItem: (product, quantity = 1, options = {}) => {
      setItems((current) => {
        const existingIndex = current.findIndex(
          (item) => item.product.slug === product.slug && item.color === options.color && item.size === options.size
        );
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + quantity };
          return next;
        }
        return [...current, { product, quantity, ...options }];
      });
      setIsOpen(true);
    },
    changeQuantity: (index, change) => setItems((current) => current
      .map((item, i) => i === index ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0)),
    removeItem: (index) => setItems((current) => current.filter((_, i) => i !== index)),
  }), [isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}