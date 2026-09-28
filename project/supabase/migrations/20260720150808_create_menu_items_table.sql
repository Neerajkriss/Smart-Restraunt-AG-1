/*
# Create menu_items table (single-tenant, no auth)

1. New Tables
- `menu_items`
  - `id` (uuid, primary key)
  - `name` (text, not null) — dish name
  - `description` (text) — short description
  - `category` (text, not null) — one of 'Starters', 'Main Course', 'Beverages'
  - `price` (integer, not null) — price in INR paise-free rupees
  - `image_url` (text) — optional image URL
  - `created_at` (timestamp)
2. Security
- Enable RLS on `menu_items`.
- Allow anon + authenticated SELECT (menu is intentionally public/read-only for customers).
- No INSERT/UPDATE/DELETE for anon (menu is seeded server-side).
*/

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price integer NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_menu_items" ON menu_items;
CREATE POLICY "anon_read_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);
