import React, { useState, useEffect } from 'react';
import { Check, Flame, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import type { MenuItem, MenuItemInput } from '../../types/menu';
import { RESTAURANT_CONFIG } from '../../config/restaurant.config';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItem | null;
  onSave: (input: MenuItemInput, id?: string) => Promise<void>;
}

const EMPTY_FORM: MenuItemInput = {
  name: '',
  description: '',
  category: RESTAURANT_CONFIG.categories[0],
  price: 0,
  image_url: '',
  available: true,
  is_popular: false,
};

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSave,
}) => {
  const [form, setForm] = useState<MenuItemInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        description: editingItem.description ?? '',
        category: editingItem.category,
        price: editingItem.price,
        image_url: editingItem.image_url ?? '',
        available: editingItem.available,
        is_popular: editingItem.is_popular,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!form.price || form.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category,
          price: Math.round(form.price),
          image_url: form.image_url.trim(),
          available: form.available,
          is_popular: form.is_popular,
        },
        editingItem ? editingItem.id : undefined
      );
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
      subtitle={editingItem ? `Editing ${editingItem.name}` : 'Create a new dish'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Dish Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            placeholder="e.g. Butter Chicken"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            >
              {RESTAURANT_CONFIG.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
              Price ({RESTAURANT_CONFIG.currencySymbol})
            </label>
            <input
              type="number"
              min={0}
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              placeholder="250"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Image URL
          </label>
          <input
            type="text"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="w-full rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-600">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full resize-none rounded-xl border border-stone-200 px-3.5 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            placeholder="Short enticing description of the dish"
          />
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setForm({ ...form, available: !form.available })}
              className={`relative h-6 w-11 rounded-full transition ${
                form.available ? 'bg-emerald-500' : 'bg-stone-300'
              }`}
              aria-label="Toggle availability"
            >
              <span
                className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition ${
                  form.available ? 'left-[1.375rem]' : 'left-0.5'
                }`}
              >
                {form.available && <Check className="h-3 w-3 text-emerald-500" />}
              </span>
            </button>
            <span className="text-sm font-medium text-stone-700">
              {form.available ? 'In Stock (Available on Customer Menu)' : 'Out of Stock (Hidden)'}
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setForm({ ...form, is_popular: !form.is_popular })}
              className={`relative h-6 w-11 rounded-full transition ${
                form.is_popular ? 'bg-amber-500' : 'bg-stone-300'
              }`}
              aria-label="Toggle popular"
            >
              <span
                className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition ${
                  form.is_popular ? 'left-[1.375rem]' : 'left-0.5'
                }`}
              >
                {form.is_popular && <Flame className="h-3 w-3 text-amber-500" />}
              </span>
            </button>
            <span className="text-sm font-medium text-stone-700">
              {form.is_popular ? 'Featured in "Top Favorites" carousel' : 'Normal Menu Item'}
            </span>
          </label>
        </div>

        {error && <p className="text-xs font-semibold text-red-500">{error}</p>}

        <div className="flex gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {editingItem ? 'Save Changes' : 'Add Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
