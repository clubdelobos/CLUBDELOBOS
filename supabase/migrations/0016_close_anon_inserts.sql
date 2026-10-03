-- Cierra la escritura anónima directa a `bookings` y `analytics_events`.
-- Antes, cualquiera con la clave pública `anon` podía hacer INSERT por PostgREST
-- y saltarse el límite de intentos, el honeypot y la validación de fechas de las
-- acciones del servidor. Ahora esas acciones insertan con el rol de servicio y
-- anon/authenticated ya no tienen política de INSERT (RLS niega por defecto).
--
-- ORDEN: despliega primero el código (usa service role) y luego aplica esto.
-- Idempotente.
drop policy if exists "bookings: anyone can create pending" on public.bookings;
drop policy if exists "bookings: anon can create pending" on public.bookings;
drop policy if exists "analytics: anyone can insert" on public.analytics_events;

revoke insert on public.bookings from anon, authenticated;
revoke insert on public.analytics_events from anon, authenticated;
