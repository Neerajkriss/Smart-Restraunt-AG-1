import React from 'react';
import { Plus, Minus } from 'lucide-react';
import type { CartLine } from '../../types/cart';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../config/restaurant.config';

interface CartItemRowProps {
  line: CartLine;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({ line }) => {
  const { increment, decrement } = useCart();
  const { item, quantity } = line;

  return (
    <li className="flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50/60 p-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-stone-200">
        {item.image_url && (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-stone-800">{item.name}</p>
        <p className="text-sm text-stone-500">
          {formatINR(item.price)} × {quantity} ={' '}
          <span className="font-semibold text-stone-700">
            {formatINR(item.price * quantity)}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
        <button
          onClick={() => decrement(item.id)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 text-stone-700 transition hover:bg-stone-200"
          aria-label={`Remove one ${item.name}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[1.25rem] text-center text-sm font-bold text-stone-800">
          {quantity}
        </span>
        <button
          onClick={() => increment(item.id)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-stone-900 transition hover:bg-amber-400"
          aria-label={`Add one ${item.name}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </li>
  );
};
