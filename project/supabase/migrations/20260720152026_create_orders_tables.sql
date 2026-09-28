/*
# Create orders + order_items tables (single-tenant, no customer auth)

1. New Tables
- `orders`
  - `id` (uuid, primary key) — also used as the human-readable order id in UPI tx note
  - `table_number` (int, not null) — dining table the order was placed from
  - `status` (text, not null, default 'Pending Payment') — order lifecycle:
      'Pending Payment' -> 'Order Received' -> 'Preparing' -> 'Ready' -> 'Served' (future)
  - `subtotal` (int, not null) — sum of item prices in INR
  - `gst` (int, not null) — 5% GST in INR
  - `total` (int, not null) — subtotal + gst, the amount the customer pays
  - `utr` (text, nullable) — UPI transaction reference ID entered by the customer
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- `order_items`
  - `id` (uuid, primary key)
  - `order_id` (uuid, fk -> orders.id ON DELETE CASCADE)
  - `menu_item_id` (uuid, fk -> menu_items.id)
  - `name` (text, not null) — dish name snapshot at order time
  - `price` (int, not null) — unit price snapshot in INR
  - `quantity` (int, not null)
2. Security
- Enable RLS on both tables.
- anon + authenticated can INSERT/SELECT/UPDATE (no customer login; orders are
  created and updated by the customer-facing app).
- No DELETE from the customer app (orders are immutable once placed).
3. Notes
- `orders.id` is a uuid; for the UPI transaction note we use a short suffix
  (last 8 chars) to keep the QR payload compact and human-friendly.
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number int NOT NULL,
  status text NOT NULL DEFAULT 'Pending Payment',
  subtotal int NOT NULL,
  gst int NOT NULL,
  total int NOT NULL,
  utr text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id),
  name text NOT NULL,
  price int NOT NULL,
  quantity int NOT NULL
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items(order_id);
