-- Reseñas reales de Google Maps de Club de Lobos Tours, cargadas a mano
-- (copiadas tal cual de la ficha) mientras no hay API key de Google Places.
-- Con el Place ID guardado, Testimonios las muestra con calificación,
-- "N reseñas en Google" y el botón "Deja tu comentario".
--
-- Reemplaza las 6 tarjetas de relleno sembradas al inicio ("La manada",
-- "Senderismo", "Camping", "Viajes", "El Salvador", "Próxima aventura").
-- Idempotente: seguro de correr más de una vez en el editor SQL de Supabase.
-- `review_date` es aproximada (Google solo dice "hace N meses"); el sitio
-- calcula la antigüedad a partir de ella.

delete from public.reviews
where author in (
  'La manada', 'Senderismo', 'Camping', 'Viajes', 'El Salvador', 'Próxima aventura',
  'Margarita Ayala', 'katherinne Mendez', 'Katherine Ovalle Amado', 'Peetikarn Pattanawit',
  'Jocelyn Aguilero', 'Jacqueline Silva', 'Roxana Guzman', 'Any Bonilla C',
  'Julio Cesar Letona', 'GERSON ALEXIS VENTURA FLORES', 'K Valle', 'Kevin Diaz', 'Mauricio Velasquez'
);

insert into public.reviews (author, review_date, rating, body_text, sort_order) values
  ('Margarita Ayala', '2026-05-22', 5, 'Muy buena experiencia viajando con ellos. El orden y la atención al detalle hacen que todo fluya bien. El ambiente es superagradable. Una gran opción para ir de turismo.', 1),
  ('Peetikarn Pattanawit', '2026-05-21', 5, 'Este tour me impresionó muchísimo. Estuvo muy bien organizado, fue muy completo y el servicio fue excepcional. El itinerario y la planificación general fueron excelentes. Lo recomiendo ampliamente, especialmente para viajeros internacionales como yo, que vengo de Tailandia.', 2),
  ('katherinne Mendez', '2026-05-20', 5, 'Excelente ,desde que he viajado con Uds me ha gustado , muy responsables , dinámicos , respetuosos , me gusta que atienden a grupos extranjeros ✨', 3),
  ('Katherine Ovalle Amado', '2026-05-19', 5, 'Son demasiado espectaculares , tuve la fortuna de tener sus servicios en San Salvador y todo espectacular . Soy colombiana ;) los ame . Súper recomendados 😍', 4),
  ('Jocelyn Aguilero', '2026-03-24', 5, 'Me gusta mucho su logística, trabajo en equipo, el respeto a cada participante y a los lugares que hemos visitado. Viajes amenos garantizados 🐺 gracias lobos. 💖', 5),
  ('Jacqueline Silva', '2026-03-23', 5, 'Excelente organización, tours pensados para todo tipo de público. Los he acompañado en muchos tours, pero mi favorito ha sido el reto de Tajumulco y Tacaná.', 6),
  ('Roxana Guzman', '2026-03-22', 5, 'Excelente servicio, he logrado realizar tours nacionales e internacionales con el club y siempre están atentos a detalles, esperar también según la condición física que requieren algunos caminos y son personas con mucho ánimo y que motivan a cumplir las metas, muy ameno también, gracias!!', 7),
  ('Any Bonilla C', '2026-03-21', 5, 'Excelente logística y ambiente, totalmente recomendados 💜', 8),
  ('Julio Cesar Letona', '2026-03-20', 5, 'Exelente Club, lleno de buena convivencia y grandes experiencias, super recomendable al 100', 9),
  ('GERSON ALEXIS VENTURA FLORES', '2026-03-19', 5, 'Experiencia Maravillosa con todos los participantes. buena comida, buen ambiente, paz total. lo mega recomiendo.', 10),
  ('K Valle', '2026-03-18', 5, 'Me encantó viajar con ustedes, excelente servicio ✨', 11),
  ('Kevin Diaz', '2026-03-17', 5, 'Excelente organización, ambiente ameno, su prioridad es que te lleves la mejor experiencia siempre! 🐺', 12),
  ('Mauricio Velasquez', '2026-03-16', 5, 'Experiencia increíble! Gerson muy ameno', 13);
