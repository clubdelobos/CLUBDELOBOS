-- Enlace de la ficha de Google Maps (el que se copia con "Compartir" en Maps).
-- Los botones de Testimonios ("Ver todas las reseñas") lo usan tal cual.
-- Idempotente: seguro de correr más de una vez en el editor SQL de Supabase.
-- Aplícala ANTES de desplegar: guardar Ajustes escribe esta columna.
alter table public.site_settings
  add column if not exists google_maps_url text not null default '';
