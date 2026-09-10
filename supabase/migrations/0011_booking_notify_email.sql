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
