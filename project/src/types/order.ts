export type OrderStatus =
  | 'Pending Payment'
  | 'Order Received'
  | 'Accepted'
  | 'Preparing'
  | 'Ready to Serve'
  | 'Completed';

export type PaymentStatus = 'Pending Verification' | 'Paid';

export interface Order {
  id: string;
  table_number: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  gst: number;
  total: number;
  utr: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  name: string;
  price: number;
  quantity: number;
}

export type OrderWithItems = Order & {
  items: OrderItemRow[];
};

export interface SessionOrder {
  id: string;
  table_number: number;
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export interface TableSession {
  table: number;
  orders: SessionOrder[];
}
