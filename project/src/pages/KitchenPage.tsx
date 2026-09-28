import React, { useEffect, useState, useCallback } from 'react';
import { ChefHat, BellRing, RefreshCw, Archive, Loader2, UtensilsCrossed } from 'lucide-react';
import type { OrderWithItems, PaymentStatus } from '../types/order';
import {
  fetchKitchenOrders,
  updateOrderStatus,
  togglePaymentStatus,
  archiveCompletedOrders,
} from '../services/orderService';
import { KitchenOrderCard } from '../components/kitchen/KitchenOrderCard';
import { ClearCompletedModal } from '../components/kitchen/ClearCompletedModal';
import { RESTAURANT_CONFIG } from '../config/restaurant.config';

const NEXT_STATUS = {
  'Order Received': 'Accepted',
  'Accepted': 'Preparing',
  'Preparing': 'Ready to Serve',
  'Ready to Serve': 'Completed',
} as const;

export const KitchenPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await fetchKitchenOrders();
      setOrders(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, RESTAURANT_CONFIG.kitchenPollIntervalMs);
    return () => clearInterval(interval);
  }, [load]);

  // Tick every second to update elapsed time badges
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNextStatus = async (order: OrderWithItems) => {
    const next = NEXT_STATUS[order.status as keyof typeof NEXT_STATUS];
    if (!next) return;
    setBusyId(order.id);
    try {
      await updateOrderStatus(order.id, next);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePaid = async (order: OrderWithItems) => {
    const next: PaymentStatus = order.payment_status === 'Paid' ? 'Pending Verification' : 'Paid';
    setBusyId(order.id);
    try {
      await togglePaymentStatus(order.id, next);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleClearCompleted = async () => {
    setClearing(true);
    setError(null);
    try {
      const count = await archiveCompletedOrders();
      setConfirmClear(false);
      await load();
      if (count === 0) setError('No completed orders to clear.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not clear completed orders');
    } finally {
      setClearing(false);
    }
  };

  // Sort: active orders first, then completed orders
  const sorted = [...orders].sort((a, b) => {
    const aActive = a.status !== 'Completed';
    const bActive = b.status !== 'Completed';
    if (aActive !== bActive) return aActive ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const activeCount = orders.filter((o) => o.status !== 'Completed').length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-stone-100 pb-16">
      {/* Sticky Kitchen Toolbar */}
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-amber-400 shadow-md">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-800">
                Kitchen Display System (KDS)
              </h1>
              <p className="text-xs text-stone-500">
                Live tickets · auto-syncs every {RESTAURANT_CONFIG.kitchenPollIntervalMs / 1000}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 sm:inline-flex">
              <BellRing className="h-3.5 w-3.5" />
              {activeCount} active tickets
            </span>

            <button
              onClick={load}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>

            <button
              onClick={() => setConfirmClear(true)}
              disabled={completedCount === 0 || clearing}
              className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
              title={completedCount === 0 ? 'No completed orders to clear' : 'Hide completed orders'}
            >
              <Archive className="h-3.5 w-3.5" />
              Clear Completed
              {completedCount > 0 && (
                <span className="ml-0.5 rounded-full bg-stone-200 px-1.5 py-0.5 text-[10px] font-bold text-stone-700">
                  {completedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main KDS Grid */}
      <main className="mx-auto max-w-7xl px-5 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-stone-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-3 text-sm font-medium">Loading incoming tickets…</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-200 text-stone-400">
              <UtensilsCrossed className="h-8 w-8" />
            </div>
            <p className="mt-4 font-semibold text-stone-700">No active kitchen orders</p>
            <p className="mt-1 text-xs text-stone-400">
              New customer orders placed from table QR codes will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((order) => (
              <KitchenOrderCard
                key={order.id}
                order={order}
                isBusy={busyId === order.id}
                onNextStatus={handleNextStatus}
                onTogglePaid={handleTogglePaid}
              />
            ))}
          </div>
        )}
      </main>

      <ClearCompletedModal
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={handleClearCompleted}
        completedCount={completedCount}
        clearing={clearing}
      />
    </div>
  );
};
