import React from 'react';
import { Plus, Minus, UtensilsCrossed, Flame } from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../config/restaurant.config';

interface FoodCardProps {
  item: MenuItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { getItemQuantity, addToCart, increment, decrement } = useCart();
  const qty = getItemQuantity(item.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300">
            <UtensilsCrossed className="h-8 w-8" />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-stone-800 shadow-sm">
          {formatINR(item.price)}
        </span>
        {item.is_popular && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-stone-900 shadow-sm">
            <Flame className="h-3 w-3" />
            Popular
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h4 className="font-semibold leading-tight text-stone-800">{item.name}</h4>
        {item.description && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">{item.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          {qty > 0 ? (
            <div className="flex items-center gap-3 rounded-full bg-stone-100 px-2 py-1.5">
              <button
                onClick={() => decrement(item.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-stone-700 shadow-sm transition hover:bg-stone-200"
                aria-label={`Remove one ${item.name}`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[1.25rem] text-center text-sm font-bold text-stone-800">
                {qty}
              </span>
              <button
                onClick={() => increment(item.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-stone-900 shadow-sm transition hover:bg-amber-400"
                aria-label={`Add one ${item.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span className="flex-1" />
          )}

          {qty === 0 && (
            <button
              onClick={() => addToCart(item.id)}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
