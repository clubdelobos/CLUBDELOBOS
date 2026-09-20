-- Método de pago de la reserva, cuentas bancarias para el mensaje de WhatsApp
-- y el Place ID de Google (reseñas reales en Testimonios).
--
-- Idempotente: seguro de correr más de una vez en el editor SQL de Supabase.
-- Aplícala ANTES de desplegar el código: el formulario público inserta
-- `payment_method` y el insert fallaría si la columna no existe.

-- 1) bookings.payment_method — NULL en reservas anteriores a esta migración.
alter table public.bookings add column if not exists payment_method text;

alter table public.bookings drop constraint if exists bookings_payment_method_chk;
alter table public.bookings add constraint bookings_payment_method_chk
  check (payment_method is null or payment_method in ('efectivo', 'transferencia'));

-- 2) Cuentas bancarias. Tabla aparte (no columnas de site_settings) porque
-- site_settings tiene "public can read": aquí solo el personal las lee.
create table if not exists public.payment_accounts (
  id uuid primary key default gen_random_uuid(),
  bank text not null check (char_length(bank) between 1 and 100),
  account_type text not null default '' check (char_length(account_type) <= 60),
  account_number text not null check (char_length(account_number) between 1 and 60),
  holder text not null default '' check (char_length(holder) <= 120),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.payment_accounts enable row level security;

drop policy if exists "payment_accounts: staff can read" on public.payment_accounts;
create policy "payment_accounts: staff can read"
  on public.payment_accounts for select
  using (public.is_staff());

drop policy if exists "payment_accounts: admin can write" on public.payment_accounts;
create policy "payment_accounts: admin can write"
  on public.payment_accounts for all
  using (public.is_admin()) with check (public.is_admin());

-- 3) Place ID de Google Maps (no es un secreto; la API key va en una env var).
alter table public.site_settings
  add column if not exists google_place_id text not null default '';
