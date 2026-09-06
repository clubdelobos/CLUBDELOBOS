-- Security hardening for the two unauthenticated write paths (bookings,
-- analytics_events). The app-layer Zod validation in
-- `src/app/actions/*.ts` only runs for requests that go through the Server
-- Action — a direct PostgREST call with the public anon key skips it. These
-- constraints and triggers move the invariants into the database, where they
-- hold regardless of how the row is inserted.
--
-- Apply in the Supabase SQL editor (or `supabase db push`).

-- ============================================================================
-- 1. Length caps on free-text columns — stop a direct insert from storing
--    arbitrarily large blobs (storage / cost abuse, dashboard poisoning).
-- ============================================================================
alter table public.bookings
  add constraint bookings_customer_name_len check (char_length(customer_name) between 1 and 200),
  add constraint bookings_email_len         check (char_length(email) between 3 and 320),
  add constraint bookings_phone_len         check (char_length(phone) between 5 and 30),
  add constraint bookings_notes_len         check (notes is null or char_length(notes) <= 1000);

alter table public.analytics_events
  add constraint analytics_path_len  check (char_length(path) between 1 and 300),
  add constraint analytics_label_len check (label is null or char_length(label) <= 200);

-- ============================================================================
-- 2. Force created_at = now() on insert — a client-supplied value lets a
--    direct PostgREST call backdate rows (fakes the dashboard timeline and,
--    for bookings, the rate-limit window). The column keeps its DEFAULT for
--    normal inserts; this trigger overrides whatever the payload sends.
-- ============================================================================
create or replace function public.force_created_at_now() returns trigger
  language plpgsql as $$
begin
  new.created_at = now();
  return new;
end;
$$;

create trigger bookings_force_created_at
  before insert on public.bookings
  for each row execute function public.force_created_at_now();

create trigger analytics_events_force_created_at
  before insert on public.analytics_events
  for each row execute function public.force_created_at_now();

-- ============================================================================
-- 3. Server-side booking throttle. The previous check in `createBooking` ran
--    as the anon role, which has no SELECT policy on `bookings`, so it always
--    saw 0. This SECURITY DEFINER function counts recent rows for an email
--    bypassing RLS, so the Server Action can call it via `.rpc()` and get a
--    real answer without granting anon any read access to the table.
-- ============================================================================
create or replace function public.recent_booking_count(p_email text)
  returns integer
  language sql
  security definer
  set search_path = public
as $$
  select count(*)::int
  from public.bookings
  where email = p_email
    and created_at > now() - interval '2 minutes';
$$;

revoke all on function public.recent_booking_count(text) from public;
grant execute on function public.recent_booking_count(text) to anon, authenticated;
