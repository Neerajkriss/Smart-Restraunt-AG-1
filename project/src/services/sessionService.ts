import type { Order, SessionOrder, TableSession } from '../types/order';
import { RESTAURANT_CONFIG } from '../config/restaurant.config';

const STORAGE_KEY = RESTAURANT_CONFIG.sessionStorageKey;
export const SESSION_EVENT = RESTAURANT_CONFIG.sessionChangeEvent;

function read(): TableSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TableSession;
    if (!parsed || typeof parsed.table !== 'number' || !Array.isArray(parsed.orders)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function write(session: TableSession | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function notifySessionChange(): void {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function getSessionForTable(table: number): TableSession | null {
  const session = read();
  if (!session || session.table !== table) return null;
  return session;
}

export function addOrderToSession(order: Order): TableSession {
  const existing = read();
  const sessionOrder: SessionOrder = {
    id: order.id,
    table_number: order.table_number,
    total: order.total,
    status: order.status,
    payment_status: order.payment_status,
    created_at: order.created_at,
  };
  if (existing && existing.table === order.table_number) {
    if (!existing.orders.some((o) => o.id === order.id)) {
      existing.orders.unshift(sessionOrder);
    }
    write(existing);
    notifySessionChange();
    return existing;
  }
  const fresh: TableSession = { table: order.table_number, orders: [sessionOrder] };
  write(fresh);
  notifySessionChange();
  return fresh;
}

export function updateOrderInSession(order: Order): TableSession | null {
  const session = read();
  if (!session) return null;
  const idx = session.orders.findIndex((o) => o.id === order.id);
  if (idx === -1) return session;
  session.orders[idx] = {
    ...session.orders[idx],
    status: order.status,
    payment_status: order.payment_status,
    total: order.total,
  };
  write(session);
  notifySessionChange();
  return session;
}

export function removeOrderFromSession(orderId: string): TableSession | null {
  const session = read();
  if (!session) return null;
  session.orders = session.orders.filter((o) => o.id !== orderId);
  const updated = session.orders.length > 0 ? session : null;
  write(updated);
  notifySessionChange();
  return updated;
}

export function clearSession(): void {
  write(null);
  notifySessionChange();
}

export function getSessionOrderIds(table: number): string[] {
  return (getSessionForTable(table)?.orders ?? []).map((o) => o.id);
}
