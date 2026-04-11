-- Gate: first-class check-in time + audit log for duplicate / invalid scans

alter table public.attendees
  add column if not exists checked_in_at timestamptz;

comment on column public.attendees.checked_in_at is 'First successful gate admission time';

-- Optional backfill for guests already marked checked_in (uses created_at as approximation)
update public.attendees
set checked_in_at = coalesce(checked_in_at, created_at)
where status = 'checked_in' and checked_in_at is null;

create table if not exists public.check_in_logs (
  id uuid primary key default gen_random_uuid(),
  attendee_id uuid references public.attendees (id) on delete cascade,
  event_type text not null check (event_type in ('admitted', 'duplicate_attempt', 'invalid_ticket')),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists check_in_logs_created_at_idx on public.check_in_logs (created_at desc);
create index if not exists check_in_logs_attendee_idx on public.check_in_logs (attendee_id);

alter table public.check_in_logs enable row level security;

-- Allow the wedding app (anon) to read logs for the gate scanner UI and insert audit rows.
-- Tighten these policies if you expose the app publicly beyond trusted staff devices.
drop policy if exists "check_in_logs_select_gate" on public.check_in_logs;
create policy "check_in_logs_select_gate"
  on public.check_in_logs for select
  using (true);

drop policy if exists "check_in_logs_insert_gate" on public.check_in_logs;
create policy "check_in_logs_insert_gate"
  on public.check_in_logs for insert
  with check (true);
