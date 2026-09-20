# Método de pago, WhatsApp desde Reservas, reseñas de Google e indexación

Aprobado por el cliente el 2026-09-20.

## Alcance
1. **Método de pago** en el formulario de reserva: solo `efectivo` o `transferencia`
   (sin tarjeta ni pasarela). Se guarda en `bookings.payment_method` y aparece en el
   correo de "nueva reserva".
2. **Cuentas bancarias** en Ajustes del sitio (tabla `payment_accounts`, no
   `site_settings`: esa tabla es legible por anon). Lectura: staff. Escritura: admin.
3. **Reservas**: el panel muestra método de pago y notas, y un botón **WhatsApp** por
   cliente que abre `wa.me/<número>` con el mensaje ya redactado (saludo por hora de
   El Salvador, salida, fecha, personas, método; con transferencia añade las cuentas).
   No hay envío automático (requeriría la API de pago de Meta). Sin listado de clientes.
4. **Testimonios**: reseñas y puntaje reales desde Google Places API (New), con
   `next.revalidate = 86400` y **sin guardarlas en la base** (los términos de Google
   limitan el almacenamiento). Si no hay key/Place ID o falla, se muestran las manuales.
   Botón "Deja tu comentario" → `search.google.com/local/writereview?placeid=…`
   (Google no permite publicar reseñas por API).
5. **Indexación**: `GOOGLE_SITE_VERIFICATION` → meta de Search Console en el layout.
   Sitemap y robots ya existían.

## Configuración pendiente del cliente
- Aplicar `supabase/migrations/0012_payments_and_google.sql` (ANTES de desplegar).
- Google Cloud: activar Places API (New), crear API key → `GOOGLE_PLACES_API_KEY`;
  Place ID en Ajustes → Reseñas de Google.
- Search Console: añadir `clubdelobos.com`, verificar, enviar `sitemap.xml`.
