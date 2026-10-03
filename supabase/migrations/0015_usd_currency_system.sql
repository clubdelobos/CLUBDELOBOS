-- La moneda ya no se escribe a mano: el sistema muestra siempre "$USD" + el precio.
-- Limpia los precios que ya traían "$", "US$" o "USD" escrito a mano y fija la moneda.
update public.tours
set price = coalesce(nullif(btrim(regexp_replace(regexp_replace(price, 'us\$|usd|\$', '', 'gi'), '\s+', ' ', 'g')), ''), 'Consultar'),
    currency_symbol = '$USD';

alter table public.tours alter column currency_symbol set default '$USD';
