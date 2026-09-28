import React from 'react';
import type { OrderStatus, PaymentStatus } from '../../types/order';

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  'Pending Payment': { label: 'Pending Payment', bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' },
  'Order Received': { label: 'Order Received', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  'Accepted': { label: 'Accepted', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  'Preparing': { label: 'Preparing', bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  'Ready to Serve': { label: 'Ready to Serve', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  'Completed': { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string; dot: string }> = {
  'Pending Verification': { label: 'Pending Verification', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  'Paid': { label: 'Paid', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
};

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
  type?: 'order' | 'payment';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'order', size = 'sm' }) => {
  const config = type === 'payment'
    ? (PAYMENT_STATUS_CONFIG[status as PaymentStatus] ?? { label: status, bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' })
    : (ORDER_STATUS_CONFIG[status as OrderStatus] ?? { label: status, bg: 'bg-stone-100', text: 'text-stone-600', dot: 'bg-stone-400' });

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
