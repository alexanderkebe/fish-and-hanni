-- RSVP extensions: plus-one and receiving / seating (run in Supabase SQL Editor or via CLI)

alter table public.attendees
  add column if not exists plus_one boolean not null default false;

alter table public.attendees
  add column if not exists plus_one_name text;

alter table public.attendees
  add column if not exists receiving_notes text;

-- Legacy combined field (older app versions); optional — safe if already present
alter table public.attendees
  add column if not exists notes text;

comment on column public.attendees.plus_one is 'Guest brings one additional person';
comment on column public.attendees.plus_one_name is 'Full name of plus-one when plus_one is true';
comment on column public.attendees.receiving_notes is 'Dietary, seating, accessibility, etc.';

-- Optional: backfill from older `notes` text (run only once if you had RSVPs before structured columns)
-- update public.attendees a
-- set
--   plus_one = case
--     when a.notes ~ '^Plus-one: No' then false
--     when a.notes ~ '^Plus-one:' then true
--     else plus_one
--   end,
--   plus_one_name = case
--     when a.notes ~ '^Plus-one:' and a.notes !~ '^Plus-one: No'
--       then trim(substring(a.notes from '^Plus-one:\s*(.+)$'))
--     else plus_one_name
--   end
-- where a.notes is not null and trim(a.notes) <> '';
