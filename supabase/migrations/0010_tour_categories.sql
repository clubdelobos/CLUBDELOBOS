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
