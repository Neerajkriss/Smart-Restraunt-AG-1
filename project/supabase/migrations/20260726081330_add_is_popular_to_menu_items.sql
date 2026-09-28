/*
# Popular items feature

1. menu_items
- Add `is_popular` (boolean, default false) so staff can manually feature dishes.
2. Notes
- Additive only; no data is lost.
*/

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS is_popular boolean NOT NULL DEFAULT false;
