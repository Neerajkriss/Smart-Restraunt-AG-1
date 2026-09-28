import React from 'react';
import { X, ClipboardList, Plus } from 'lucide-react';
import { useTable } from '../../context/TableContext';
import { useCart } from '../../context/CartContext';
import { OrderStatusCard } from './OrderStatusCard';

export const OrderTrackingDrawer: React.FC = () => {
  const { session, isStatusOpen, setIsStatusOpen } = useTable();
  const { setIsCartOpen } = useCart();
  const orders = session?.orders ?? [];

  const handleAddMore = () => {
    setIsStatusOpen(false);
    setIsCartOpen(true);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          isStatusOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsStatusOpen(false)}
      />
      <aside
        className={`fixed bottom-0 left-1/2 z-50 flex max-h-[92vh] w-full max-w-md -translate-x-1/2 flex-col rounded-t-3xl bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isStatusOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Active order status"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-800">Current Order Status</h3>
            <p className="text-xs text-stone-500">
              {session
                ? `Table #${session.table} · ${orders.length} order${orders.length !== 1 ? 's' : ''}`
                : 'No active orders'}
            </p>
          </div>
          <button
            onClick={() => setIsStatusOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition hover:bg-stone-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                <ClipboardList className="h-7 w-7" />
              </div>
              <p className="mt-4 font-medium text-stone-700">No active orders</p>
              <p className="mt-1 text-sm text-stone-500">
                Place an order to see its live status here.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <li key={o.id}>
                  <OrderStatusCard order={o} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-stone-100 px-5 py-4">
          <button
            onClick={handleAddMore}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 font-semibold text-stone-900 shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 active:scale-[0.99]"
          >
            <Plus className="h-5 w-5" />
            Add More Food
          </button>
        </div>
      </aside>
    </>
  );
};
