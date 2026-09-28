import React, { createContext, useContext, useState, useMemo } from 'react';
import type { MenuItem } from '../types/menu';
import type { CartLine, CartMap, CartTotals } from '../types/cart';
import { RESTAURANT_CONFIG } from '../config/restaurant.config';

interface CartContextType {
  cart: CartMap;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  getItemQuantity: (id: string) => number;
  addToCart: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clearCart: () => void;
  getCartLines: (menu: MenuItem[]) => CartLine[];
  calculateTotals: (menu: MenuItem[]) => CartTotals;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartMap>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const getItemQuantity = (id: string): number => cart[id] ?? 0;

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const increment = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const decrement = (id: string) => {
    setCart((prev) => {
      const current = prev[id] ?? 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: current - 1 };
    });
  };

  const clearCart = () => {
    setCart({});
  };

  const totalItems = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const getCartLines = (menu: MenuItem[]): CartLine[] => {
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const item = menu.find((m) => m.id === id);
        return item ? { item, quantity } : null;
      })
      .filter((l): l is CartLine => l !== null);
  };

  const calculateTotals = (menu: MenuItem[]): CartTotals => {
    const lines = getCartLines(menu);
    const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
    const gst = Math.round(subtotal * RESTAURANT_CONFIG.gstRate);
    const total = subtotal + gst;
    return {
      itemCount: totalItems,
      subtotal,
      gst,
      total,
    };
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        isCartOpen,
        setIsCartOpen,
        getItemQuantity,
        addToCart,
        increment,
        decrement,
        clearCart,
        getCartLines,
        calculateTotals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
