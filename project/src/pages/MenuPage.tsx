import React, { useEffect, useState, useMemo } from 'react';
import { UtensilsCrossed, Loader2, ClipboardList, Clock } from 'lucide-react';
import type { MenuItem } from '../types/menu';
import { fetchAvailableMenuItems } from '../services/menuService';
import { useTable } from '../context/TableContext';
import { useCart } from '../context/CartContext';
import { RESTAURANT_CONFIG, formatINR } from '../config/restaurant.config';
import { Navbar } from '../components/common/Navbar';
import { FoodCard } from '../components/menu/FoodCard';
import { PopularCarousel } from '../components/menu/PopularCarousel';
import { CartDrawer } from '../components/cart/CartDrawer';
import { OrderTrackingDrawer } from '../components/order/OrderTrackingDrawer';

export const MenuPage: React.FC = () => {
  const { table, hasActiveOrders, activeOrders, isStatusOpen, setIsStatusOpen } = useTable();
  const { totalItems, isCartOpen, setIsCartOpen, calculateTotals } = useCart();

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const items = await fetchAvailableMenuItems();
        if (active) {
          setMenu(items);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load menu');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const menuByCategory = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    for (const cat of RESTAURANT_CONFIG.categories) map[cat] = [];
    for (const item of menu) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  }, [menu]);

  const popularItems = useMemo(
    () => menu.filter((i) => i.is_popular).slice(0, 8),
    [menu]
  );

  const totals = calculateTotals(menu);

  if (table === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-800">
            No Table Number Found
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Please scan the QR code located on your dining table, or append your table number to the
            URL, e.g.{' '}
            <code className="rounded-md bg-stone-200 px-2 py-0.5 text-xs font-mono font-bold text-stone-800">
              /menu?table=1
            </code>
            .
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3].map((t) => (
              <a
                key={t}
                href={`/menu?table=${t}`}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
              >
                Table {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5">
        {/* Welcome Hero Banner */}
        <section className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800 p-6 shadow-xl sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Welcome to
          </p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {RESTAURANT_CONFIG.restaurantName}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-stone-300 leading-relaxed">
            {RESTAURANT_CONFIG.tagline}
          </p>
        </section>

        {/* Top Favorites Carousel */}
        <PopularCarousel items={popularItems} />

        {/* Menu Listings */}
        {loading ? (
          <div className="mt-16 flex flex-col items-center justify-center text-stone-400">
            <Loader2 className="h-7 w-7 animate-spin" />
            <p className="mt-3 text-sm">Loading delicious food…</p>
          </div>
        ) : error ? (
          <div className="mt-16 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-semibold text-red-700">Couldn't load the menu</p>
            <p className="mt-1 text-xs text-red-500">{error}</p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {RESTAURANT_CONFIG.categories.map((cat) => {
              const items = menuByCategory[cat] ?? [];
              if (items.length === 0) return null;

              return (
                <section key={cat}>
                  <div className="mb-4 flex items-center gap-3">
                    <h3 className="text-xl font-bold tracking-tight text-stone-800">{cat}</h3>
                    <span className="h-px flex-1 bg-stone-200" />
                    <span className="text-xs font-semibold text-stone-400">
                      {items.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <FoodCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Bar */}
      {totalItems > 0 && !isCartOpen ? (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl bg-amber-500 px-5 py-3.5 text-stone-900 shadow-2xl shadow-amber-500/30 transition active:scale-[0.98]"
        >
          <span className="flex items-center gap-2 font-bold">
            <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-stone-900 px-1.5 text-xs font-bold text-amber-400">
              {totalItems}
            </span>
            View Cart
          </span>
          <span className="font-bold">{formatINR(totals.total)}</span>
        </button>
      ) : hasActiveOrders && !isCartOpen && !isStatusOpen ? (
        <button
          onClick={() => setIsStatusOpen(true)}
          className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between rounded-2xl bg-emerald-600 px-5 py-3.5 text-white shadow-2xl shadow-emerald-600/30 transition active:scale-[0.98]"
        >
          <span className="flex items-center gap-2 font-bold">
            <ClipboardList className="h-5 w-5" />
            {activeOrders.length} Active Order{activeOrders.length > 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <Clock className="h-4 w-4 animate-pulse" />
            Check Live Status
          </span>
        </button>
      ) : null}

      <CartDrawer menu={menu} />
      <OrderTrackingDrawer />
    </div>
  );
};
