import { supabase } from './supabaseClient';
import type { SalesSummary, MonthlyArchiveSummary } from '../types/analytics';
import type { OrderStatus, PaymentStatus } from '../types/order';

export async function fetchSalesSummary(): Promise<SalesSummary> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('orders')
    .select('id, table_number, status, payment_status, total, archived, created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data as Array<{
    id: string;
    table_number: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    total: number;
    archived: boolean;
    created_at: string;
  }>) ?? [];

  const completedOrPaid = rows.filter(
    (r) => r.status === 'Completed' || r.payment_status === 'Paid'
  );
  const totalRevenue = completedOrPaid.reduce((s, r) => s + (r.total || 0), 0);

  const todayRows = rows.filter((r) => new Date(r.created_at) >= startOfDay);
  const totalOrdersToday = todayRows.length;

  const activeStatuses: OrderStatus[] = ['Order Received', 'Accepted', 'Preparing', 'Ready to Serve'];
  const activeTables = new Set(
    rows.filter((r) => !r.archived && activeStatuses.includes(r.status)).map((r) => r.table_number)
  ).size;

  return { totalRevenue, totalOrdersToday, activeTables };
}

export async function archiveMonthlyData(): Promise<MonthlyArchiveSummary[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, total, status, payment_status, archived, created_at')
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  const rows = (data as Array<{
    id: string;
    total: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    archived: boolean;
    created_at: string;
  }>) ?? [];

  const byMonth: Record<string, { count: number; revenue: number; ids: string[] }> = {};
  for (const r of rows) {
    if (r.archived) continue;
    const d = new Date(r.created_at);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[monthKey]) byMonth[monthKey] = { count: 0, revenue: 0, ids: [] };
    byMonth[monthKey].count += 1;
    byMonth[monthKey].revenue += r.total || 0;
    byMonth[monthKey].ids.push(r.id);
  }

  const summaries: MonthlyArchiveSummary[] = Object.entries(byMonth)
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([monthKey, v]) => {
      const [y, m] = monthKey.split('-');
      const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      });
      return { monthKey, label, orderCount: v.count, revenue: v.revenue };
    });

  const allIds = Object.values(byMonth).flatMap((v) => v.ids);
  if (allIds.length > 0) {
    const { error: updError } = await supabase
      .from('orders')
      .update({ archived: true, archived_at: new Date().toISOString() })
      .in('id', allIds);

    if (updError) throw new Error(updError.message);
  }

  return summaries;
}

export async function fullSystemReset(): Promise<number> {
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('id');

  if (error) throw new Error(error.message);
  return (data ?? []).length;
}
