-- Generic fixed-window rate limiter for the unauthenticated write paths
-- (booking form, analytics beacon). Backs up the app-layer checks so a script
-- hammering the Supabase REST endpoint directly with the public anon key still
-- gets throttled.
--
-- Apply in the Supabase SQL editor (or `supabase db push`).

create table if not exists public.rate_limits (
  bucket        text primary key,
  count         integer not null default 0,
  window_start  timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- No policies on purpose: the SECURITY DEFINER function below is the only
-- thing that may read or write this table.

-- Returns true when the call is allowed, false when the bucket is over its
-- limit for the current window. A fixed window (not a sliding one) — cheap and
-- good enough to blunt floods.
create or replace function public.rate_limit_hit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
  language plpgsql
  security definer
  set search_path = public
as $$
declare
  v_count integer;
  v_start timestamptz;
begin
  insert into public.rate_limits as rl (bucket, count, window_start)
    values (p_key, 1, now())
  on conflict (bucket) do update
    set count = case
          when rl.window_start < now() - make_interval(secs => p_window_seconds) then 1
          else rl.count + 1
        end,
        window_start = case
          when rl.window_start < now() - make_interval(secs => p_window_seconds) then now()
          else rl.window_start
        end
  returning count, window_start into v_count, v_start;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.rate_limit_hit(text, integer, integer) from public;
grant execute on function public.rate_limit_hit(text, integer, integer) to anon, authenticated;

-- Housekeeping: drop buckets whose window is long over. Safe to run on a
-- schedule (Supabase cron / pg_cron) — nothing depends on old rows.
create or replace function public.purge_stale_rate_limits() returns void
  language sql
  security definer
  set search_path = public
as $$
  delete from public.rate_limits where window_start < now() - interval '1 day';
$$;
