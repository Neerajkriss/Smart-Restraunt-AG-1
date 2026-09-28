/*
# Order lifecycle: archiving + master reset support

1. orders
- Add `archived` (boolean, default false). Archived orders stay in the DB for
  monthly analytics but are hidden from the active kitchen queue and the
  default admin sales cards.
- Add `archived_at` (timestamptz, nullable) for audit.
2. Security
- Allow anon + authenticated DELETE on orders so the Admin master reset can
  wipe order history (order_items cascade via ON DELETE CASCADE).
3. Notes
- Additive only; no data is lost.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
