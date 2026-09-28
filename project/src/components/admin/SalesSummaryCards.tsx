import React from 'react';
import { IndianRupee, ShoppingBag, LayoutGrid } from 'lucide-react';
import type { SalesSummary } from '../../types/analytics';
import { formatINR } from '../../config/restaurant.config';

interface SalesSummaryCardsProps {
  summary: SalesSummary | null;
}

export const SalesSummaryCards: React.FC<SalesSummaryCardsProps> = ({ summary }) => {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Revenue */}
      <div className="rounded-2xl border border-stone-200 bg-emerald-50 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-stone-600">Total Revenue</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <IndianRupee className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold text-emerald-700">
          {summary ? formatINR(summary.totalRevenue) : '—'}
        </p>
        <p className="mt-1 text-xs text-stone-500">Completed & paid orders</p>
      </div>

      {/* Orders Today */}
      <div className="rounded-2xl border border-stone-200 bg-blue-50 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-stone-600">Orders Today</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white">
            <ShoppingBag className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold text-blue-700">
          {summary ? String(summary.totalOrdersToday) : '—'}
        </p>
        <p className="mt-1 text-xs text-stone-500">Since midnight today</p>
      </div>

      {/* Active Tables */}
      <div className="rounded-2xl border border-stone-200 bg-amber-50 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-stone-600">Active Tables</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
            <LayoutGrid className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-3 text-3xl font-bold text-amber-700">
          {summary ? String(summary.activeTables) : '—'}
        </p>
        <p className="mt-1 text-xs text-stone-500">Currently in progress</p>
      </div>
    </section>
  );
};
