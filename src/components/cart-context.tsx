import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/products";

type CartLine = { product: Product; quantity: number };
type CartContextValue = {
  items: CartLine[];
  isOpen: boolean;
  totalItems: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  changeQuantity: (slug: string, change: number) => void;
  removeItem: (slug: string) => void;
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
    addItem: (product, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.product.slug === product.slug);
        if (existing) return current.map((item) => item.product.slug === product.slug ? { ...item, quantity: item.quantity + quantity } : item);
        return [...current, { product, quantity }];
      });
      setIsOpen(true);
    },
    changeQuantity: (slug, change) => setItems((current) => current
      .map((item) => item.product.slug === slug ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0)),
    removeItem: (slug) => setItems((current) => current.filter((item) => item.product.slug !== slug)),
  }), [isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}