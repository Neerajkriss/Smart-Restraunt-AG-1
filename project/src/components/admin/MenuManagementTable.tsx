import React from 'react';
import { Pencil, Trash2, UtensilsCrossed, Flame, Loader2 } from 'lucide-react';
import type { MenuItem } from '../../types/menu';
import { RESTAURANT_CONFIG, formatINR } from '../../config/restaurant.config';

interface MenuManagementTableProps {
  menuByCategory: Record<string, MenuItem[]>;
  busyId: string | null;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleAvailable: (item: MenuItem) => void;
  onTogglePopular: (item: MenuItem) => void;
}

export const MenuManagementTable: React.FC<MenuManagementTableProps> = ({
  menuByCategory,
  busyId,
  onEdit,
  onDelete,
  onToggleAvailable,
  onTogglePopular,
}) => {
  return (
    <div className="space-y-6">
      {RESTAURANT_CONFIG.categories.map((cat) => {
        const items = menuByCategory[cat] ?? [];
        if (items.length === 0) return null;

        return (
          <div key={cat}>
            <div className="mb-3 flex items-center gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                {cat}
              </h3>
              <span className="h-px flex-1 bg-stone-200" />
              <span className="text-xs text-stone-400 font-medium">{items.length} items</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500 border-b border-stone-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Popular</th>
                    <th className="px-4 py-3 font-semibold">Availability</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {items.map((item) => {
                    const isBusy = busyId === item.id;
                    return (
                      <tr key={item.id} className="align-middle hover:bg-stone-50/50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-stone-300">
                                  <UtensilsCrossed className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-stone-800">{item.name}</p>
                              {item.description && (
                                <p className="line-clamp-1 text-xs text-stone-400">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-stone-700">
                          {formatINR(item.price)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onTogglePopular(item)}
                            disabled={isBusy}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60 ${
                              item.is_popular
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            <Flame
                              className={`h-3.5 w-3.5 ${
                                item.is_popular ? 'text-amber-500' : 'text-stone-400'
                              }`}
                            />
                            {item.is_popular ? 'Featured' : 'Normal'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onToggleAvailable(item)}
                            disabled={isBusy}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition disabled:opacity-60 ${
                              item.available
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                item.available ? 'bg-emerald-500' : 'bg-stone-400'
                              }`}
                            />
                            {item.available ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onEdit(item)}
                              disabled={isBusy}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-stone-600 transition hover:bg-stone-200"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDelete(item)}
                              disabled={isBusy}
                              className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                              aria-label="Delete"
                            >
                              {isBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};
