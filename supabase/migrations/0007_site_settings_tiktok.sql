-- Adds an optional TikTok URL to the site's social links, alongside the
-- existing Facebook / Instagram / YouTube fields. Additive and safe to run on
-- an existing site_settings row.
alter table public.site_settings
  add column if not exists social_tiktok_url text;
