create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  hotel_key text not null,
  location_key text,
  hotel_name text not null,
  hotel_url text,
  image_url text,
  place_name text,
  check_in date not null,
  check_out date not null,
  rooms integer not null default 1 check (rooms between 1 and 20),
  adults integer not null default 1 check (adults between 1 and 50),
  child_ages smallint[] not null default '{}' check (
    cardinality(child_ages) <= 20
    and 0 <= all(child_ages)
    and 17 >= all(child_ages)
  ),
  pets integer not null default 0 check (pets between 0 and 20),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  provider_code text,
  provider_name text,
  nightly_rate numeric not null check (nightly_rate >= 0),
  total_price numeric not null check (total_price >= 0),
  rate_collected_at timestamptz not null,
  hotel_snapshot jsonb not null default '{}' check (jsonb_typeof(hotel_snapshot) = 'object'),
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  constraint reservations_dates_check check (check_out > check_in),
  constraint reservations_lifecycle_check check (
    (status = 'confirmed' and cancelled_at is null)
    or (status = 'cancelled' and cancelled_at is not null)
  )
);

comment on table public.reservations is
  'Internal StayAI demo reservations; not live hotel bookings.';

create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hotel_key text not null,
  hotel_snapshot jsonb not null default '{}' check (jsonb_typeof(hotel_snapshot) = 'object'),
  created_at timestamptz not null default now(),
  constraint bookmarks_user_hotel_unique unique (user_id, hotel_key)
);

comment on table public.bookmarks is
  'User-owned saved hotel snapshots sourced from Xotelo.';

create index reservations_user_status_check_in_idx
  on public.reservations (user_id, status, check_in desc);
create index reservations_user_created_at_idx
  on public.reservations (user_id, created_at desc);
create index bookmarks_user_created_at_idx
  on public.bookmarks (user_id, created_at desc);

create or replace function private.enforce_reservation_cancellation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if to_jsonb(new) - array['status', 'cancelled_at']::text[]
     is distinct from
     to_jsonb(old) - array['status', 'cancelled_at']::text[] then
    raise exception 'Reservation details are immutable after creation';
  end if;

  if old.status <> 'confirmed' or new.status <> 'cancelled' then
    raise exception 'Only confirmed reservations can be cancelled';
  end if;

  new.cancelled_at := coalesce(new.cancelled_at, now());
  return new;
end;
$$;

revoke all on function private.enforce_reservation_cancellation() from public, anon, authenticated;

create trigger reservations_enforce_cancellation
before update on public.reservations
for each row execute function private.enforce_reservation_cancellation();

alter table public.reservations enable row level security;
alter table public.reservations force row level security;
alter table public.bookmarks enable row level security;
alter table public.bookmarks force row level security;

create policy reservations_select_own on public.reservations
for select to authenticated
using ((select auth.uid()) = user_id);

create policy reservations_insert_own on public.reservations
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and status = 'confirmed'
  and cancelled_at is null
);

create policy reservations_cancel_own on public.reservations
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy bookmarks_select_own on public.bookmarks
for select to authenticated
using ((select auth.uid()) = user_id);

create policy bookmarks_insert_own on public.bookmarks
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy bookmarks_delete_own on public.bookmarks
for delete to authenticated
using ((select auth.uid()) = user_id);

revoke all on public.reservations from anon, authenticated;
revoke all on public.bookmarks from anon, authenticated;

grant select, insert on public.reservations to authenticated;
grant update (status, cancelled_at) on public.reservations to authenticated;
grant select, insert, delete on public.bookmarks to authenticated;
