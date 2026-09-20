# Conectar las reseñas de Google Maps al sitio

Para quien administra la ficha **Club de Lobos Tours** en Google Maps.
No crea ni modifica nada en la ficha: solo genera una *llave de lectura* para que el
sitio pueda mostrar las reseñas que ya existen.

Tarda unos 10 minutos. Necesita la cuenta de Google que administra la ficha y una
tarjeta para activar la facturación de Google Cloud (el crédito gratis mensual de
Google cubre de sobra el uso de este sitio; conviene crear una alerta de presupuesto).

## 1. Crear la llave (Google Cloud)
1. Entra a https://console.cloud.google.com con la cuenta de la ficha.
2. Selector de proyectos (arriba) → **Nuevo proyecto** → nombre "Club de Lobos" → Crear.
3. Menú → **Facturación** → vincula una cuenta de facturación (tarjeta).
4. Menú → **APIs y servicios → Biblioteca** → busca **Places API (New)** → **Habilitar**.
   (Tiene que ser la que dice "(New)".)
5. Menú → **APIs y servicios → Credenciales → + Crear credenciales → Clave de API**.
6. Abre la clave creada → **Restricciones de API → Restringir clave → Places API (New)** → Guardar.
   Sin restricción de sitio web ni de IP.
7. Copia la clave (empieza con `AIza…`). **No la compartas por chat ni correo abierto.**

## 2. Ponerla en el sitio (Vercel)
1. Vercel → proyecto → **Settings → Environment Variables → Add**.
2. Key: `GOOGLE_PLACES_API_KEY` · Value: la clave · Type: **Secret/Sensitive** ·
   Environments: **Production** (y Preview si se quiere).
3. **Redeploy** el último despliegue (las variables nuevas no se aplican a despliegues ya hechos).

## 3. Comprobar desde el panel
1. Panel admin → **Ajustes → Reseñas de Google**.
2. Verifica que el **Place ID** esté guardado.
3. Pulsa **Probar conexión**. Debe decir "Conectado a Club de Lobos Tours · 5,0 ★ · 14 reseñas".
   Si falla, el mensaje indica qué falta (facturación, API sin habilitar, restricción de la key…).

## Cómo se comporta el sitio
- Con la conexión funcionando, **Testimonios** muestra las reseñas de Google (Google entrega
  hasta 5, las más relevantes) y se actualiza solo cada 24 h.
- Sin conexión, o si Google falla, muestra las reseñas cargadas a mano en
  **Panel → Testimonios** (el panel avisa cada 15 días que toca revisar Google Maps).
- El botón **"Deja tu comentario"** abre la pantalla de reseña de Google Maps de la ficha
  (ahí el cliente puede escribir su comentario y subir fotos). Funciona con o sin conexión.
