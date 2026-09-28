import React from 'react';
import { Flame, Plus, UtensilsCrossed } from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../config/restaurant.config';

interface PopularCarouselProps {
  items: MenuItem[];
}

export const PopularCarousel: React.FC<PopularCarouselProps> = ({ items }) => {
  const { addToCart } = useCart();

  if (items.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold tracking-tight text-stone-800">Top Favorites</h3>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          Most loved
        </span>
      </div>

      <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-3 [scrollbar-width:thin]">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => addToCart(item.id)}
            className="group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
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
                  <UtensilsCrossed className="h-7 w-7" />
                </div>
              )}
              <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-stone-900 shadow-sm">
                <Flame className="h-3 w-3" />
                Popular
              </span>
            </div>

            <div className="flex flex-1 flex-col p-3">
              <p className="line-clamp-1 font-semibold text-stone-800">{item.name}</p>
              <p className="line-clamp-1 text-xs text-stone-500">
                {item.description ?? item.category}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-stone-800">{formatINR(item.price)}</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-stone-900 shadow-sm transition group-hover:bg-amber-400">
                  <Plus className="h-4 w-4" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
