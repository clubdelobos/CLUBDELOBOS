-- Adds coarse origin metadata to analytics events so the dashboard can show
-- which countries and device types the traffic comes from. Both are derived
-- server-side from platform edge headers (x-vercel-ip-country + user-agent);
-- no IP address or precise location is ever stored.
--
-- Additive and safe to run on an existing analytics_events table. Until this
-- is applied the app keeps working — those columns just read as null.
alter table public.analytics_events
  add column if not exists country text,
  add column if not exists device text;
