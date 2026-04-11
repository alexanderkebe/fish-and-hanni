-- Links a plus-one ticket row to the primary guest (separate QR per person)

alter table public.attendees
  add column if not exists party_leader_id uuid references public.attendees (id) on delete cascade;

create index if not exists attendees_party_leader_id_idx on public.attendees (party_leader_id);

comment on column public.attendees.party_leader_id is 'If set, this row is the plus-one ticket for the referenced primary guest';
