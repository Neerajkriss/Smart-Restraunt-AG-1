import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LayoutGrid, Plus, Settings, AlertCircle, Check, Loader2 } from 'lucide-react';
import type { MenuItem, MenuItemInput } from '../types/menu';
import type { SalesSummary } from '../types/analytics';
import {
  fetchAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  toggleItemPopular,
} from '../services/menuService';
import {
  fetchSalesSummary,
  archiveMonthlyData,
  fullSystemReset,
} from '../services/analyticsService';
import { clearSession } from '../services/sessionService';
import { SalesSummaryCards } from '../components/admin/SalesSummaryCards';
import { TableQRGenerator } from '../components/admin/TableQRGenerator';
import { MenuManagementTable } from '../components/admin/MenuManagementTable';
import { MenuItemModal } from '../components/admin/MenuItemModal';
import { SystemResetModal } from '../components/admin/SystemResetModal';
import { RESTAURANT_CONFIG } from '../config/restaurant.config';

export const AdminPage: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SalesSummary | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState<null | 'archive' | 'full'>(null);
  const [resetResult, setResetResult] = useState<string | null>(null);

  const loadMenu = useCallback(async () => {
    try {
      const items = await fetchAllMenuItems();
      setMenu(items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    try {
      const s = await fetchSalesSummary();
      setSummary(s);
    } catch {
      /* non-fatal */
    }
  }, []);

  useEffect(() => {
    loadMenu();
    loadSummary();
    const interval = setInterval(loadSummary, RESTAURANT_CONFIG.summaryPollIntervalMs);
    return () => clearInterval(interval);
  }, [loadMenu, loadSummary]);

  const menuByCategory = useMemo(() => {
    const map: Record<string, MenuItem[]> = {};
    for (const cat of RESTAURANT_CONFIG.categories) map[cat] = [];
    for (const item of menu) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  }, [menu]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditorOpen(true);
  };

  const handleSaveItem = async (input: MenuItemInput, id?: string) => {
    if (id) {
      await updateMenuItem(id, input);
    } else {
      await createMenuItem(input);
    }
    await loadMenu();
  };

  const handleDeleteItem = async (item: MenuItem) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setBusyId(item.id);
    try {
      await deleteMenuItem(item.id);
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    setBusyId(item.id);
    try {
      await toggleItemAvailability(item.id, item.available);
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePopular = async (item: MenuItem) => {
    setBusyId(item.id);
    try {
      await toggleItemPopular(item.id, item.is_popular);
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const handleArchiveMonthly = async () => {
    setResetBusy('archive');
    setResetResult(null);
    try {
      const summaries = await archiveMonthlyData();
      await loadSummary();
      setSettingsOpen(false);
      if (summaries.length === 0) {
        setError('No unarchived orders to archive.');
      } else {
        const total = summaries.reduce((s, m) => s + m.orderCount, 0);
        setError(null);
        setResetResult(`Archived ${total} order(s) across ${summaries.length} month(s).`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Archive failed');
    } finally {
      setResetBusy(null);
    }
  };

  const handleFullReset = async () => {
    setResetBusy('full');
    setResetResult(null);
    try {
      const count = await fullSystemReset();
      clearSession();
      await loadSummary();
      setSettingsOpen(false);
      setResetResult(`System reset complete. ${count} order(s) permanently deleted.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setResetBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 pb-16">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-amber-400 shadow-md">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-800">
                Admin Management Dashboard
              </h1>
              <p className="text-xs text-stone-500">Menu control, analytics & table management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-stone-900 shadow-sm transition hover:bg-amber-400 active:scale-[0.99]"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
            <button
              onClick={() => {
                setSettingsOpen(true);
                setResetResult(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Sales Performance Cards */}
        <SalesSummaryCards summary={summary} />

        {/* Table Standee QR Code Section */}
        <section className="mt-8">
          <TableQRGenerator />
        </section>

        {/* Menu Management Section */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-800">Live Menu Catalog</h2>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <Plus className="h-3.5 w-3.5" />
              New Dish
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <Loader2 className="h-7 w-7 animate-spin" />
              <p className="mt-3 text-sm">Loading menu items…</p>
            </div>
          ) : (
            <MenuManagementTable
              menuByCategory={menuByCategory}
              busyId={busyId}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteItem}
              onToggleAvailable={handleToggleAvailable}
              onTogglePopular={handleTogglePopular}
            />
          )}
        </section>

        {resetResult && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
            <Check className="h-4 w-4 shrink-0" />
            {resetResult}
          </div>
        )}
      </main>

      <MenuItemModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        editingItem={editingItem}
        onSave={handleSaveItem}
      />

      <SystemResetModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onArchive={handleArchiveMonthly}
        onFullReset={handleFullReset}
        busy={resetBusy}
      />
    </div>
  );
};
