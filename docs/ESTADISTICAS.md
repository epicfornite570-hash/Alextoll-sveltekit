# Estadísticas de visitas

Contador propio, sin Google Analytics ni servicios externos.

- **Qué cuenta:** páginas vistas, de dónde llega la gente (Google, Instagram, directo...), móvil u
  ordenador, y cuántos pulsan **WhatsApp**, **llamar**, **email** o **envían el formulario**.
- **Privacidad:** no usa cookies, no guarda IPs ni nada que identifique a nadie. Solo suma totales por
  día. Por eso **no hace falta banner de cookies**. Si el navegador del visitante pide "no rastrear", no
  se cuenta.
- **Dónde se guarda:** en tu propio servidor (archivos en `/var/lib/alextoll`) si usas nginx, o en
  Netlify Blobs si la web está en Netlify. Las dos versiones cuentan igual (`servidor/contador.mjs`).

## Cómo funciona

| Pieza | Archivo |
|---|---|
| Aviso desde cada página | `js/modules/visitas.js` |
| Recibe los avisos y da los datos al panel (nginx) | `servidor/api.mjs` (direcciones `/api/visita` y `/api/estadisticas`) |
| Lo mismo, si la web está en Netlify | `netlify/functions/visita.mjs` y `estadisticas.mjs` |
| Lógica común de contar | `servidor/contador.mjs` |
| Panel privado | `src/routes/estadisticas/+page.svelte` (→ `estadisticas.html`) + `static/js/estadisticas.js` + `static/css/estadisticas.css` |

## Ponerlo en marcha con nginx (tu servidor)

Sigue `deploy/SUBIR-A-NGINX.md`, apartado 3. Para probarlo en tu PC:
`STATS_KEY=prueba node servidor/api.mjs` (escucha en `http://127.0.0.1:3001`).

## Ponerlo en marcha en Netlify (una vez)

> Las funciones de Netlify **no funcionan si subes la web arrastrando la carpeta**. Hay que publicarla
> **desde GitHub** (lo recomendado, ver `LEEME.md`) o con `npx netlify deploy --prod`.

1. Publica la web desde GitHub en Netlify (ver `LEEME.md`, apartado 1).
2. En Netlify: **Site configuration → Environment variables → Add a variable**:
   - Key: `STATS_KEY`
   - Value: una contraseña larga que solo sepas tú (por ejemplo, cinco palabras al azar).
   - Scopes: marca **Functions**.
3. **Deploys → Trigger deploy → Deploy site** para que la función lea la clave.
4. Abre `https://alextoll.store/estadisticas.html`, escribe la clave y marca
   **"No contar mis visitas desde este navegador"** (así no te cuentas a ti mismo). Hazlo también en tu
   móvil.

El panel no está enlazado desde ninguna parte de la web y no aparece en Google. Aunque alguien lo
encontrara, sin la clave no ve nada.

## Usar el panel

- **7 / 30 / 90 días:** cambia el periodo de todo el panel.
- **Tasa de contacto:** de cada 100 visitas, cuántas te escribieron o llamaron. Es el número que más
  importa: si sube, la web funciona.
- **Visitas por día:** pasa el ratón por las columnas o usa las flechas del teclado. Debajo tienes los
  mismos datos en una tabla.
- **De dónde llegan:** "Directo" es quien escribe la dirección, usa un marcador o escanea el QR del
  cartel o la tarjeta.

## Detalles técnicos

- Los datos se guardan por día en el almacén `estadisticas` de Netlify Blobs (una clave `AAAA-MM-DD`
  por día). Puedes verlos en Netlify → **Blobs**.
- El panel pide como mucho 90 días.
- Con mucho tráfico simultáneo podría perderse alguna visita suelta (dos avisos en el mismo instante).
  Para una web local es irrelevante.
- Para dejar de contar: quita `'visitas'` de la lista `ORDEN` de `js/main.js`.
