import React from 'react';
import { Clock, Banknote, CheckCircle2, ChefHat, Loader2 } from 'lucide-react';
import type { OrderWithItems, OrderStatus } from '../../types/order';
import { StatusBadge } from '../common/StatusBadge';
import { formatINR } from '../../config/restaurant.config';

interface KitchenOrderCardProps {
  order: OrderWithItems;
  isBusy: boolean;
  onNextStatus: (order: OrderWithItems) => void;
  onTogglePaid: (order: OrderWithItems) => void;
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  'Order Received': 'Accepted',
  'Accepted': 'Preparing',
  'Preparing': 'Ready to Serve',
  'Ready to Serve': 'Completed',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  'Order Received': 'Accept Order',
  'Accepted': 'Start Preparing',
  'Preparing': 'Mark Ready',
  'Ready to Serve': 'Mark as Served',
};

function timeElapsed(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (m >= 1) return `${m}m ${s}s ago`;
  return `${s}s ago`;
}

export const KitchenOrderCard: React.FC<KitchenOrderCardProps> = ({
  order,
  isBusy,
  onNextStatus,
  onTogglePaid,
}) => {
  const isDone = order.status === 'Completed';
  const next = NEXT_STATUS[order.status];
  const nextLabel = NEXT_LABEL[order.status];

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
        isDone ? 'border-stone-200 opacity-75' : 'border-stone-200 hover:shadow-md'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Table</p>
          <p className="text-2xl font-bold leading-none text-stone-800">
            #{order.table_number}
          </p>
        </div>
        <div className="text-right">
          <StatusBadge status={order.status} type="order" />
          <p className="mt-1 font-mono text-[11px] text-stone-400">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 px-4 py-3">
        <ul className="space-y-1.5">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-stone-700">
                <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-stone-900 px-1.5 text-xs font-bold text-amber-400">
                  {it.quantity}×
                </span>
                <span className="font-medium">{it.name}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Metadata */}
      <div className="space-y-2 border-t border-stone-100 px-4 py-3 text-xs">
        <div className="flex items-center justify-between text-stone-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {timeElapsed(order.created_at)}
          </span>
          <span className="font-semibold text-stone-700">{formatINR(order.total)}</span>
        </div>
        <div className="flex items-center justify-between">
          <StatusBadge status={order.payment_status} type="payment" size="sm" />
          {order.utr ? (
            <span className="font-mono text-[11px] text-stone-500">UTR: {order.utr}</span>
          ) : (
            <span className="text-[11px] text-stone-400">No UTR provided</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 border-t border-stone-100 px-4 py-3">
        <button
          onClick={() => onTogglePaid(order)}
          disabled={isBusy}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition disabled:opacity-60 ${
            order.payment_status === 'Paid'
              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          {order.payment_status === 'Paid' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Banknote className="h-4 w-4" />
          )}
          {order.payment_status === 'Paid' ? 'Mark as Pending' : 'Mark as Paid'}
        </button>

        {next && nextLabel && (
          <button
            onClick={() => onNextStatus(order)}
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChefHat className="h-4 w-4" />
            )}
            {nextLabel}
          </button>
        )}

        {isDone && (
          <p className="text-center text-xs font-medium text-emerald-600">Order completed</p>
        )}
      </div>
    </article>
  );
};
