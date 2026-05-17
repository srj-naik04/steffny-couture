-- Migration: 005_seed_alteration_types
-- Date:      2026-05-17
-- Purpose:   Seed the alteration_types reference table. Mirrors
--            constants/alteration-types.ts — keep the two in sync.
-- Rollback:  delete from public.alteration_types.
-- Note:      idempotent — re-running updates existing rows.

insert into public.alteration_types
  (id, label, description, estimated_min_price, estimated_max_price, estimated_days, icon, sort_order, active)
values
  ('hem', 'Hem',
   'Shorten or lengthen the hemline of a dress, skirt or trousers.',
   15, 45, 5, 'Ruler', 1, true),
  ('take_in', 'Take in',
   'Bring a garment closer to the body for a more tailored fit.',
   25, 70, 7, 'Scissors', 2, true),
  ('take_out', 'Take out',
   'Let out seams to give a garment a little more room.',
   25, 70, 7, 'MoveHorizontal', 3, true),
  ('sleeves', 'Sleeves',
   'Shorten, lengthen or reshape sleeves.',
   20, 60, 7, 'Shirt', 4, true),
  ('bodice', 'Bodice',
   'Reshape or restructure the bodice for fit and support.',
   40, 120, 10, 'Heart', 5, true),
  ('zipper', 'Zipper replacement',
   'Replace a broken or worn zip.',
   20, 50, 5, 'Zap', 6, true),
  ('embellishment', 'Embellishment',
   'Add or repair beading, lace or decorative detail.',
   35, 120, 10, 'Sparkles', 7, true),
  ('other', 'Something else',
   'Not sure which fits — describe it and Steffi will advise.',
   15, 120, 7, 'CircleHelp', 8, true)
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description,
  estimated_min_price = excluded.estimated_min_price,
  estimated_max_price = excluded.estimated_max_price,
  estimated_days = excluded.estimated_days,
  icon = excluded.icon,
  sort_order = excluded.sort_order,
  active = excluded.active;
