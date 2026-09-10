-- ============================================================================
-- Club de Lobos — ESQUEMA COMPLETO para un proyecto Supabase NUEVO / vacío.
-- Es la concatenación de supabase/migrations/0001..0011 en orden.
-- Pega TODO este archivo en el editor SQL de Supabase y ejecútalo UNA vez.
-- (En un proyecto que ya tenga tablas, usa las migraciones individuales.)
-- Generado: 2026-09-09
-- ============================================================================


-- ==================== 0001_init.sql ====================

-- GuiaNatours CMS schema
-- Site: guianatours-com-co-e923d4eb / root-8a5edab2
--
-- Apply with `supabase db push` once the project is linked, or paste this
-- whole file into the Supabase SQL Editor for a one-off bootstrap.

create extension if not exists pgcrypto;

-- ============================================================================
-- profiles — role gate. One row per auth.users row.
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'worker' check (role in ('admin', 'worker')),
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER: reads profiles bypassing RLS, so policies on OTHER tables
-- can call this without recursing back into profiles' own RLS.
create function public.current_role() returns text
  language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as $$
  select public.current_role() = 'admin';
$$;

create function public.is_worker() returns boolean
  language sql stable security definer set search_path = public as $$
  select public.current_role() = 'worker';
$$;

create function public.is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select public.current_role() in ('admin', 'worker');
$$;

-- A new Supabase Auth user gets a 'worker' profile row automatically (least
-- privilege by default). Promoting the first admin is a one-time manual step:
--   update public.profiles set role = 'admin' where id = '<uuid>';
-- Every subsequent admin/worker account is created through the admin panel's
-- service-role Server Action, never through this trigger's default role.
create function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- profiles RLS: read-only for the owning user and for admins. Deliberately NO
-- authenticated insert/update policy — role assignment only ever happens via
-- the service-role client (bypasses RLS), so a worker can never self-promote.
create policy "profiles: self can read own row"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles: admin can read all rows"
  on public.profiles for select
  using (public.is_admin());

-- ============================================================================
-- site_settings — singleton row: logos, contact, socials, palette, footer.
-- ============================================================================
create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  logo_header_url text,
  logo_footer_url text,
  favicon_url text,
  phone_label text not null default '+503 7952-8033 / +503 7554-6785',
  phone_href text not null default 'tel:+50379528033',
  email text not null default '',
  address text,
  social_facebook_url text,
  social_instagram_url text,
  social_youtube_url text,
  palette_1 text not null default '#235652',
  palette_2 text not null default '#183f3c',
  palette_3 text not null default '#373435',
  palette_5 text not null default '#686c6a',
  palette_7 text not null default '#f4f2be',
  palette_8 text not null default '#fbfaec',
  footer_registro text,
  footer_copyright text not null default '© 2026 Club de Lobos.',
  footer_credit_label text not null default '',
  footer_credit_href text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (
  id, logo_header_url, logo_footer_url, favicon_url, address,
  social_instagram_url, footer_registro
)
values (
  1,
  '/brand/lobos/logo-white-640.png',
  '/brand/lobos/logo-white-1024.png',
  '/brand/lobos/favicon-32.png',
  'El Salvador',
  'https://www.instagram.com/lobos_sv/',
  'El Salvador · Senderismo, camping y viajes en manada'
);

alter table public.site_settings enable row level security;

create policy "site_settings: public can read"
  on public.site_settings for select
  using (true);

create policy "site_settings: admin can write"
  on public.site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- nav_links — main menu
-- ============================================================================
create table public.nav_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.nav_links enable row level security;

create policy "nav_links: public can read"
  on public.nav_links for select
  using (true);

create policy "nav_links: admin can write"
  on public.nav_links for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- hero_slides — hero carousel
-- ============================================================================
create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image_w integer not null,
  image_h integer not null,
  heading text not null,
  description text not null,
  button_label text not null default 'Mira los próximos destinos',
  href text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

create policy "hero_slides: public can read published"
  on public.hero_slides for select
  using (is_published = true);

create policy "hero_slides: admin can read all"
  on public.hero_slides for select
  using (public.is_admin());

create policy "hero_slides: admin can write"
  on public.hero_slides for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- tours — "Próximos destinos" cards
-- ============================================================================
create table public.tours (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  price text not null,
  currency_symbol text not null default '$',
  departure_start date not null,
  departure_end date,
  image_url text not null,
  image_w integer not null,
  image_h integer not null,
  hover_image_url text,
  hover_image_w integer,
  hover_image_h integer,
  button_label text not null default 'Ver salida',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.tours enable row level security;

create policy "tours: public can read published"
  on public.tours for select
  using (is_published = true);

-- Staff (admin + worker) can see every tour regardless of publish state, so a
-- booking referencing an unpublished tour still resolves for the worker view.
create policy "tours: staff can read all"
  on public.tours for select
  using (public.is_staff());

create policy "tours: admin can write"
  on public.tours for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- content_blocks — generic single-row-per-key JSONB blocks for the fixed
-- "Guías expertos", "Camping" and "Fotografías de la semana" sections.
-- ============================================================================
create table public.content_blocks (
  key text primary key check (key in ('guias', 'camping', 'fotografias')),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.content_blocks (key, data) values
  ('guias', '{"heading":"Aventuras que nos conectan","buttonLabel":"Mira la próxima salida","buttonHref":"/#proximas-aventuras","images":[]}'::jsonb),
  ('camping', '{"heading":"Somos Club de Lobos","body":"Somos un club de amigos que nos encanta la aventura: senderismo, viajes, camping y vivir cada experiencia al máximo.","buttonLabel":"Síguenos en Instagram","buttonHref":"https://www.instagram.com/lobos_sv/","image":null}'::jsonb),
  ('fotografias', '{"heading":"Historias de la manada","body":"Momentos, rutas y paisajes compartidos por Club de Lobos."}'::jsonb);

alter table public.content_blocks enable row level security;

create policy "content_blocks: public can read"
  on public.content_blocks for select
  using (true);

create policy "content_blocks: admin can write"
  on public.content_blocks for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- gallery_items — "Fotografías de la semana" justified gallery
-- ============================================================================
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  image_w integer not null,
  image_h integer not null,
  title text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

create policy "gallery_items: public can read published"
  on public.gallery_items for select
  using (is_published = true);

create policy "gallery_items: admin can read all"
  on public.gallery_items for select
  using (public.is_admin());

create policy "gallery_items: admin can write"
  on public.gallery_items for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- reviews — curated review list (the original's Trustindex widget is not real)
-- ============================================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  review_date date not null,
  rating smallint not null check (rating between 1 and 5),
  body_text text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "reviews: public can read published"
  on public.reviews for select
  using (is_published = true);

create policy "reviews: admin can read all"
  on public.reviews for select
  using (public.is_admin());

create policy "reviews: admin can write"
  on public.reviews for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================================
-- bookings — reservations. Public can only create one; staff can view; only
-- admin can update/delete. This is the table the worker role exists to see.
-- ============================================================================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  phone text not null,
  tour_id uuid not null references public.tours (id) on delete restrict,
  requested_date date not null,
  num_people integer not null check (num_people between 1 and 50),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

-- Public can only INSERT, and only ever as 'pending' — a client can never
-- create a pre-confirmed booking by tampering with the request payload.
create policy "bookings: anon can create pending"
  on public.bookings for insert
  to anon
  with check (status = 'pending');

create policy "bookings: staff can read"
  on public.bookings for select
  using (public.is_staff());

-- Worker is explicitly read-only ("únicamente podrá ver") — no update/delete
-- policy is granted to the worker role at all, only to admin.
create policy "bookings: admin can update"
  on public.bookings for update
  using (public.is_admin()) with check (public.is_admin());

create policy "bookings: admin can delete"
  on public.bookings for delete
  using (public.is_admin());

-- ============================================================================
-- updated_at maintenance
-- ============================================================================
create function public.touch_updated_at() returns trigger
  language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_site_settings before update on public.site_settings
  for each row execute function public.touch_updated_at();

create trigger touch_content_blocks before update on public.content_blocks
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- Storage buckets: low-churn brand assets vs. high-churn content media.
-- Client-supplied Content-Type headers are spoofable — allowed_mime_types is
-- enforced by Storage itself, not just the app layer.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-assets', 'site-assets', true, 2097152, array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/x-icon']),
  ('media', 'media', true, 8388608, array['image/png', 'image/jpeg', 'image/webp']);

create policy "site-assets: public can read"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "site-assets: admin can write"
  on storage.objects for all
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

create policy "media: public can read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media: admin can write"
  on storage.objects for all
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());


-- ==================== 0002_bookings_insert_authenticated.sql ====================

-- Fix: the public booking form must work for a visitor who happens to have
-- an active admin/worker session in the same browser too, not just a truly
-- anonymous visitor. The original policy was scoped `to anon` only, so an
-- authenticated staff session (no dedicated INSERT policy existed for it)
-- got rejected by RLS instead of falling back to the anon policy.
drop policy "bookings: anon can create pending" on public.bookings;

create policy "bookings: anyone can create pending"
  on public.bookings for insert
  to anon, authenticated
  with check (status = 'pending');


-- ==================== 0003_analytics.sql ====================

-- Lightweight, self-hosted analytics: page views and CTA/tour clicks from the
-- public site, so the dashboard can show real traffic instead of nothing.
-- No third-party analytics script — visitors never leave this database.
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('page_view', 'tour_click', 'cta_click', 'social_click')),
  path text not null,
  label text,
  created_at timestamptz not null default now()
);

create index analytics_events_created_at_idx on public.analytics_events (created_at desc);
create index analytics_events_type_created_idx on public.analytics_events (event_type, created_at desc);

alter table public.analytics_events enable row level security;

-- Any visitor (anon) or logged-in staff can log an event — write-only from
-- the client, same shape as the public booking form.
create policy "analytics: anyone can insert"
  on public.analytics_events for insert
  to anon, authenticated
  with check (event_type in ('page_view', 'tour_click', 'cta_click', 'social_click'));

-- Only admins can read the numbers back, on the dashboard.
create policy "analytics: admin can read"
  on public.analytics_events for select
  to authenticated
  using (public.is_admin());


-- ==================== 0004_tour_images.sql ====================

-- Tours can now carry 1-5 photos (a small gallery) instead of a fixed
-- primary + hover pair. Replaces the 6 flat image columns with one ordered
-- JSONB array: [{ "url": "...", "width": 1200, "height": 800 }, ...].
-- images[0] is the card thumbnail / detail-page hero; images[1], if present,
-- is still used for the card's hover-swap effect — see
-- src/lib/queries/site-content.ts getTours().
alter table public.tours add column images jsonb not null default '[]'::jsonb;

update public.tours set images = (
  select jsonb_agg(img) from (
    values
      (jsonb_build_object('url', image_url, 'width', image_w, 'height', image_h)),
      (case when hover_image_url is not null
        then jsonb_build_object('url', hover_image_url, 'width', hover_image_w, 'height', hover_image_h)
        else null end)
  ) as t(img)
  where img is not null
);

alter table public.tours
  drop column image_url,
  drop column image_w,
  drop column image_h,
  drop column hover_image_url,
  drop column hover_image_w,
  drop column hover_image_h;

alter table public.tours add constraint tours_images_length check (jsonb_array_length(images) between 1 and 5);


-- ==================== 0005_tour_departure_dates.sql ====================

-- Tours now list up to 10 discrete departure dates instead of a single
-- start/end range. The public booking form only ever offers these exact
-- dates (see createBooking's server-side check in
-- src/app/actions/bookings.ts) — never a free date picker.
alter table public.tours add column departure_dates jsonb not null default '[]'::jsonb;

update public.tours set departure_dates = jsonb_build_array(departure_start::text);

alter table public.tours
  drop column departure_start,
  drop column departure_end;

alter table public.tours add constraint tours_departure_dates_length check (jsonb_array_length(departure_dates) between 1 and 10);


-- ==================== 0006_analytics_meta.sql ====================

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


-- ==================== 0007_site_settings_tiktok.sql ====================

-- Adds an optional TikTok URL to the site's social links, alongside the
-- existing Facebook / Instagram / YouTube fields. Additive and safe to run on
-- an existing site_settings row.
alter table public.site_settings
  add column if not exists social_tiktok_url text;


-- ==================== 0008_security_hardening.sql ====================

-- Security hardening for the two unauthenticated write paths (bookings,
-- analytics_events). The app-layer Zod validation in
-- `src/app/actions/*.ts` only runs for requests that go through the Server
-- Action — a direct PostgREST call with the public anon key skips it. These
-- constraints and triggers move the invariants into the database, where they
-- hold regardless of how the row is inserted.
--
-- Idempotent: safe to paste into the Supabase SQL editor and run more than once.

-- ============================================================================
-- 1. Length caps on free-text columns — stop a direct insert from storing
--    arbitrarily large blobs (storage / cost abuse, dashboard poisoning).
-- ============================================================================
alter table public.bookings drop constraint if exists bookings_customer_name_len;
alter table public.bookings drop constraint if exists bookings_email_len;
alter table public.bookings drop constraint if exists bookings_phone_len;
alter table public.bookings drop constraint if exists bookings_notes_len;

alter table public.bookings
  add constraint bookings_customer_name_len check (char_length(customer_name) between 1 and 200),
  add constraint bookings_email_len         check (char_length(email) between 3 and 320),
  add constraint bookings_phone_len         check (char_length(phone) between 5 and 30),
  add constraint bookings_notes_len         check (notes is null or char_length(notes) <= 1000);

alter table public.analytics_events drop constraint if exists analytics_path_len;
alter table public.analytics_events drop constraint if exists analytics_label_len;

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

drop trigger if exists bookings_force_created_at on public.bookings;
create trigger bookings_force_created_at
  before insert on public.bookings
  for each row execute function public.force_created_at_now();

drop trigger if exists analytics_events_force_created_at on public.analytics_events;
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


-- ==================== 0009_rate_limit.sql ====================

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


-- ==================== 0010_tour_categories.sql ====================

-- Salidas clasificadas por categoría (nacional / internacional) y, solo para
-- las nacionales, por subcategoría (rios / pueblos / volcanes). Alimenta el
-- filtro público bajo "Próximas aventuras" y el selector del panel admin
-- (Aventuras y salidas → Nueva / Editar salida).
--
-- Idempotente: seguro de pegar y correr más de una vez en el editor SQL de
-- Supabase.
--
-- Las salidas existentes quedan `category = 'nacional'` por el DEFAULT. La
-- obligatoriedad de la subcategoría para nacionales se valida en la capa de
-- la app (Zod, en src/app/admin/(protected)/tours/actions.ts) — aquí la
-- columna admite NULL para no forzar un backfill con un valor inventado.

alter table public.tours add column if not exists category text not null default 'nacional';
alter table public.tours add column if not exists subcategory text;

alter table public.tours drop constraint if exists tours_category_chk;
alter table public.tours drop constraint if exists tours_subcategory_chk;

alter table public.tours add constraint tours_category_chk
  check (category in ('nacional', 'internacional'));

-- Subcategoría: NULL siempre permitido; un valor solo si la salida es
-- nacional y pertenece al conjunto conocido.
alter table public.tours add constraint tours_subcategory_chk
  check (
    subcategory is null
    or (category = 'nacional' and subcategory in ('rios', 'pueblos', 'volcanes'))
  );

-- Consulta habitual del sitio público: filtrar publicadas por categoría.
create index if not exists tours_category_idx on public.tours (category, subcategory);


-- ==================== 0011_booking_notify_email.sql ====================

-- Dirección donde caen los avisos de "nueva reserva". La edita el admin en
-- Ajustes del sitio (Contacto → "Correo para notificaciones de reservas") y
-- la lee el Server Action `createBooking` para enviar el correo vía Resend
-- (ver src/lib/email/*, src/app/actions/bookings.ts).
--
-- Idempotente: seguro de correr más de una vez en el editor SQL de Supabase.
--
-- Nota: site_settings tiene la policy "public can read", así que técnicamente
-- el rol anon puede leer esta columna por PostgREST. Es una dirección de rol
-- (p. ej. reservas@tu-dominio), no un secreto, y no se expone en ninguna
-- vista pública (`getSiteSettings()` no la mapea). Si se quisiera ocultar,
-- moverla a una función SECURITY DEFINER como `recent_booking_count`.

alter table public.site_settings
  add column if not exists booking_notify_email text not null default '';

