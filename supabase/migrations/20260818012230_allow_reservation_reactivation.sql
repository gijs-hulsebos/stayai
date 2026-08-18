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

  if old.status = 'confirmed' and new.status = 'cancelled' then
    new.cancelled_at := coalesce(new.cancelled_at, now());
  elsif old.status = 'cancelled' and new.status = 'confirmed' then
    new.cancelled_at := null;
  else
    raise exception 'Only reservation cancellation or reactivation is allowed';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_reservation_cancellation() from public, anon, authenticated;
