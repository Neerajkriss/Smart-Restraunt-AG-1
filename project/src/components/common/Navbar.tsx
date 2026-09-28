import React from 'react';
import { UtensilsCrossed, Bell, ShoppingCart } from 'lucide-react';
import { useTable } from '../../context/TableContext';
import { useCart } from '../../context/CartContext';
import { RESTAURANT_CONFIG } from '../../config/restaurant.config';

export const Navbar: React.FC = () => {
  const { table, hasActiveOrders, activeOrders, setIsStatusOpen } = useTable();
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-stone-900/95 backdrop-blur supports-[backdrop-filter]:bg-stone-900/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-stone-900 shadow-lg shadow-amber-500/20">
            <UtensilsCrossed className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              {RESTAURANT_CONFIG.restaurantName}
            </h1>
            <p className="text-xs font-medium text-amber-400">
              {table !== null ? `Table #${table} · Dine-in` : RESTAURANT_CONFIG.subTagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveOrders && (
            <button
              onClick={() => setIsStatusOpen(true)}
              className="relative inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              <Bell className="h-4 w-4 animate-pulse" />
              <span className="hidden sm:inline">Order Status</span>
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-stone-900">
                {activeOrders.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full bg-stone-800 p-2.5 text-stone-200 transition hover:bg-stone-700"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-stone-900">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
