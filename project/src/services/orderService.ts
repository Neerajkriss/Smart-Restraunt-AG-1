import { supabase } from './supabaseClient';
import type { Order, OrderItemRow, OrderWithItems, OrderStatus, PaymentStatus } from '../types/order';
import type { CartLine } from '../types/cart';

export async function createOrder(
  table: number,
  lines: CartLine[],
  subtotal: number,
  gst: number,
  total: number
): Promise<Order> {
  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      table_number: table,
      status: 'Pending Payment',
      payment_status: 'Pending Verification',
      subtotal,
      gst,
      total,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  const created = order as Order;

  const rows = lines.map((l) => ({
    order_id: created.id,
    menu_item_id: l.item.id,
    name: l.item.name,
    price: l.item.price,
    quantity: l.quantity,
  }));

  const { error: itemsError } = await supabase.from('order_items').insert(rows);
  if (itemsError) throw new Error(itemsError.message);

  return created;
}

export async function submitOrder(orderId: string, utr: string | null): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status: 'Order Received',
      utr: utr || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Order;
}

export async function fetchOrdersByIds(ids: string[]): Promise<Order[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('orders')
    .select('id, table_number, status, payment_status, subtotal, gst, total, utr, archived, created_at, updated_at')
    .in('id', ids);

  if (error) throw new Error(error.message);
  return (data as Order[]) ?? [];
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, table_number, status, payment_status, subtotal, gst, total, utr, archived, created_at, updated_at')
    .eq('id', orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as Order) ?? null;
}

export async function fetchKitchenOrders(): Promise<OrderWithItems[]> {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, table_number, status, payment_status, subtotal, gst, total, utr, archived, created_at, updated_at')
    .not('status', 'eq', 'Pending Payment')
    .eq('archived', false)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  const orderRows = (orders as Order[]) ?? [];
  if (orderRows.length === 0) return [];

  const ids = orderRows.map((o) => o.id);
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, order_id, menu_item_id, name, price, quantity')
    .in('order_id', ids);

  if (itemsError) throw new Error(itemsError.message);
  const itemRows = (items as OrderItemRow[]) ?? [];

  return orderRows.map((o) => ({
    ...o,
    items: itemRows.filter((i) => i.order_id === o.id),
  }));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}

export async function archiveCompletedOrders(): Promise<number> {
  const { data, error } = await supabase
    .from('orders')
    .update({ archived: true, archived_at: new Date().toISOString() })
    .eq('status', 'Completed')
    .eq('archived', false)
    .select('id');

  if (error) throw new Error(error.message);
  return (data ?? []).length;
}

export async function togglePaymentStatus(orderId: string, payment_status: PaymentStatus): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ payment_status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) throw new Error(error.message);
}
