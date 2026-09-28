import React from 'react';
import { formatINR, RESTAURANT_CONFIG } from '../../config/restaurant.config';

interface BillBreakdownProps {
  subtotal: number;
  gst: number;
  total: number;
  compact?: boolean;
}

export const BillBreakdown: React.FC<BillBreakdownProps> = ({
  subtotal,
  gst,
  total,
  compact = false,
}) => {
  const gstPercent = Math.round(RESTAURANT_CONFIG.gstRate * 100);

  return (
    <dl className="space-y-1.5 text-sm">
      <div className="flex justify-between text-stone-500">
        <dt>Subtotal</dt>
        <dd className="font-medium text-stone-700">{formatINR(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-stone-500">
        <dt>GST ({gstPercent}%)</dt>
        <dd className="font-medium text-stone-700">{formatINR(gst)}</dd>
      </div>
      <div
        className={`mt-2 flex justify-between border-t border-dashed border-stone-200 pt-3 ${
          compact ? 'text-sm' : 'text-base'
        }`}
      >
        <dt className="font-semibold text-stone-800">Total Bill</dt>
        <dd className="font-bold text-stone-900">{formatINR(total)}</dd>
      </div>
    </dl>
  );
};
