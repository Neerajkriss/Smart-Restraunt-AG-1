import React from 'react';
import type { SessionOrder } from '../../types/order';
import { StatusBadge } from '../common/StatusBadge';
import { StatusProgress } from './StatusProgress';
import { formatINR } from '../../config/restaurant.config';

interface OrderStatusCardProps {
  order: SessionOrder;
}

function timeElapsed(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  if (m >= 1) return `${m}m ${s}s ago`;
  return `${s}s ago`;
}

export const OrderStatusCard: React.FC<OrderStatusCardProps> = ({ order }) => {
  const isDone = order.status === 'Completed';

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        isDone ? 'border-stone-200 bg-stone-50' : 'border-stone-200 bg-white shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Order</p>
          <p className="font-mono text-sm font-semibold text-stone-700">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="text-right">
          <StatusBadge status={order.status} type="order" />
          <p className="mt-1 text-xs text-stone-400">{timeElapsed(order.created_at)}</p>
        </div>
      </div>

      <StatusProgress status={order.status} />

      <div className="mt-4 flex items-center justify-between text-sm border-t border-stone-100 pt-2.5">
        <span className="text-stone-500">Total</span>
        <span className="font-bold text-stone-800">{formatINR(order.total)}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-stone-500">Payment</span>
        <StatusBadge status={order.payment_status} type="payment" size="sm" />
      </div>
    </div>
  );
};
