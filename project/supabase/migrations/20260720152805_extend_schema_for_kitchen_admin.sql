/*
# Extend schema for Kitchen + Admin views

1. menu_items
- Add `available` (boolean, default true) so Admin can toggle In/Out of stock.
2. orders
- Add `payment_status` (text, default 'Pending Verification') — separate from
  the kitchen lifecycle status. Values: 'Pending Verification' | 'Paid'.
- Broaden `status` comment to cover the full kitchen lifecycle:
  'Pending Payment' | 'Order Received' | 'Accepted' | 'Preparing' |
  'Ready to Serve' | 'Completed'.
3. Security
- menu_items: allow anon + authenticated INSERT/UPDATE/DELETE so the Admin
  dashboard (no login) can manage the menu.
- orders: already allows SELECT/INSERT/UPDATE for anon.
4. Notes
- These are additive column adds (idempotent via DO blocks); no data is lost.
*/

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS available boolean NOT NULL DEFAULT true;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'Pending Verification';

-- Allow menu management from the no-auth admin dashboard
DROP POLICY IF EXISTS "anon_insert_menu_items" ON menu_items;
CREATE POLICY "anon_insert_menu_items" ON menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_menu_items" ON menu_items;
CREATE POLICY "anon_update_menu_items" ON menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_menu_items" ON menu_items;
CREATE POLICY "anon_delete_menu_items" ON menu_items FOR DELETE
  TO anon, authenticated USING (true);
