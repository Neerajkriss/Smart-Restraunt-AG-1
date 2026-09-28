import type { MenuItem } from './menu';

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

export type CartItem = CartLine;

export type CartMap = Record<string, number>;

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  gst: number;
  total: number;
}
