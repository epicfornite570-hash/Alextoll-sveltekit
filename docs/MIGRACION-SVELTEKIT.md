# Cómo se pasó la web a SvelteKit

**Fechas:** del 29 al 30 de octubre de 2026 · **Publicada:** 30 de octubre de 2026
**Cambio en GitHub:** PR #3 del repositorio privado (rama `sveltekit`, ya en `main`)

La regla desde el principio fue: **pasarlo todo a SvelteKit en una rama aparte y no publicar nada hasta
que funcionara y se viera exactamente igual que la web publicada**. Esta guía cuenta qué había antes, qué
hay ahora, cómo se hizo paso a paso, los problemas que salieron y cómo se comprobó.

---

## 1. Antes y después

| | Antes | Ahora |
|---|---|---|
| Páginas | HTML generado por scripts propios (`tools/plantilla.js` + `tools/generar-*.js`, `npm run paginas`) y algunos HTML escritos a mano | Componentes Svelte en `src/`; `npm run build` genera HTML estático en `build/` |
| Textos | Dentro de cada generador | `src/lib/textos/` (español e inglés juntos) |
| Datos (servicios, webs de ejemplo...) | Dentro de los generadores | `src/lib/datos/` |
| Piezas repetidas (`<head>`, menú, pie, cookies) | Copiadas en la plantilla | Componentes: `Cabeza`, `Menu`, `Pie`, `PieMini`, `Final`... en `src/lib/componentes/` |
| CSS, JS del navegador, imágenes | En la raíz (`css/`, `js/`, `assets/`) | En `static/` (se copia tal cual al build) |
| Sitemap | Generado por un script | `src/routes/sitemap.xml/+server.js` |
| Qué se sube al NAS | La carpeta del proyecto | Solo `build/` |

Las direcciones son **las mismas de siempre** (`ordenadores.html`, `en/computers.html`...), así que Google y
los enlaces que ya existían no notan nada.

### Correspondencia de archivos

| Antes | Ahora |
|---|---|
| `index.html` | `src/routes/+page.svelte` → `src/lib/paginas/Portada.svelte` |
| `ordenadores.html` / `en/computers.html` | `src/routes/ordenadores/` y `src/routes/en/computers/` → `src/lib/paginas/Ordenadores.svelte` |
| `webs.html`, `reparacion-moviles.html` | Igual: una ruta por idioma y una página compartida (`Webs.svelte`, `Moviles.svelte`) |
| `*-madrid.html` (páginas de servicio) | `src/routes/[servicio=servicio]/` + `src/params/servicio.js` + `src/lib/datos/paginas-servicio.js` |
| Páginas legales, `gracias`, `resena` | `src/routes/<nombre>/` con `PaginaTexto.svelte` |
| `404.html` | `src/routes/404/+page.svelte` |
| `tools/plantilla.js` (cabecera, menú, pie) | `src/lib/componentes/` y `src/lib/sitio.js` (menús, ficha del negocio, textos comunes) |

---

## 2. Cómo se hizo, paso a paso

### Paso 0 · Preparar
- Rama nueva `sveltekit` sacada de `main`. `main` no se tocó hasta el final.
- Proyecto SvelteKit 2 + Svelte 5 + Vite 7 con `@sveltejs/adapter-static` (todo se genera como HTML,
  no hace falta servidor de Node en el NAS).
- `svelte.config.js`: `prerender: { entries: ['*'], crawl: false }` para generar todas las rutas, y
  `csp: { mode: 'hash' }` (ver el punto 4).
- `trailingSlash: 'never'` para que salgan `ordenadores.html` y no `ordenadores/index.html`
  (la portada en inglés, `en/`, usa `'always'`).

### Paso 1 · Fase 1: mismas páginas, mismo HTML
1. Mover `css/`, `js/`, `assets/`, `robots.txt`, manifest, favicon... a `static/`.
2. Sacar de los generadores los textos (`src/lib/textos/`) y los datos (`src/lib/datos/`).
3. Convertir la plantilla en componentes (`Cabeza`, `Menu`, `Pie`, `Final`...).
4. Crear una ruta por página. Las páginas con versión en inglés comparten un componente en
   `src/lib/paginas/` y reciben `lang`.
5. `src/hooks.server.js` pone el idioma (`<html lang>`) de cada página y, en la 404, `<base href="/">`
   para que sus enlaces funcionen desde cualquier dirección. `src/hooks.js` hace que en `npm run dev`
   funcionen las direcciones `.html`.
6. Comparar el HTML generado con el de antes, página a página, hasta que todas salieran iguales.

En esta fase el navegador seguía igual: solo el HTML, sin JavaScript de SvelteKit.

### Paso 2 · Fase 2 (base): SvelteKit también en el navegador
1. Activar la hidratación (`csr`), para que en el futuro las partes interactivas se puedan pasar a Svelte.
2. Los scripts de siempre (`static/js/...`) ya no van como `<script src>` dentro del HTML: se cargan
   después de hidratar desde `src/routes/+layout.svelte` con `src/lib/legado.js`
   (`usarScripts([...])` para los normales y `usarModulos([...])` para los módulos, como el 3D del 404).
3. `<body data-sveltekit-reload>`: al pulsar un enlace se carga la página entera, igual que antes.

### Paso 3 · Juntar lo que estaba publicado
Mientras tanto, en el PC había cambios publicados que no estaban en `main`: el rediseño
**«Conoce a Alextoll»** (sustituye a «Sobre mí»), la **portada de Halloween**, el **404 en 3D**, cookies
nuevas, nginx reforzado, flujos de n8n y `security.txt`. Se subieron a GitHub (ramas `rediseno-conoce` y
`conoce-y-halloween`) y se pasaron también a SvelteKit:
- `src/lib/componentes/Conoce.svelte` + `src/lib/textos/conoce.js`. `/sobre-mi` y `/en/about` redirigen (301) a https://alextoll.xyz/.
- `HALLOWEEN` en `src/lib/paginas/Portada.svelte` (con `false` vuelve el vídeo de siempre).
- `src/routes/404/+page.svelte` con el modelo 3D (`static/assets/3d/`) y three.js en `static/js/vendor/`.

### Paso 4 · Subir con copia y poder volver atrás
- `tools/subir-al-nas.sh` ahora hace `npm ci` (si hace falta) y `npm run build`, comprueba que existen
  `index.html` y `404.html`, **guarda lo que hay en el NAS en `.anterior/`** y sube `build/`, `nginx.conf`,
  `docker-compose.yml` y `servidor/`. Si el build falla no sube nada.
- `tools/volver-atras.sh` (nuevo) vuelve a poner lo de `.anterior/` en un momento.

---

## 3. Problemas que salieron y cómo se arreglaron

| Problema | Causa | Arreglo |
|---|---|---|
| Textos de lectores de pantalla pegados («Nuevapestaña») | Svelte quita los espacios del principio y final de un elemento | Escribir el espacio dentro de la expresión: `{' ' + texto}` |
| Al pasar a inglés, el desplegable de servicios seguía en español | `js/modules/idioma.js` buscaba los `<script src>` de la otra página para cargar `js/data/*.en.js`, y ahora no hay | `Final.svelte` escribe la lista de scripts en `<script type="application/json" id="at-scripts">` y `idioma.js` la lee |
| La CSP bloqueaba el script de arranque de SvelteKit | Es un script dentro de la página | `csp: { mode: 'hash' }`: SvelteKit pone un `<meta>` con su huella. En nginx/netlify, `script-src 'self' 'unsafe-inline'` (el `<meta>` sigue limitando los scripts en línea a ese) |
| La CSP bloqueaba un estilo de SvelteKit | `#svelte-announcer` lleva `style="..."` | `style-src` con `'unsafe-hashes'` y la huella exacta de ese estilo. **Si se actualiza SvelteKit, comprobar que no cambia** |
| En la web publicada no cargaba la textura del 404 en 3D | three.js lee la textura del `.glb` con `blob:` | `connect-src` con `blob:` |
| Archivos de `_app/` sin caché ni límites | Carpeta nueva de SvelteKit | nginx: `_app/` en la zona de archivos y `_app/immutable/` con caché de un año (`immutable`; el nombre cambia en cada build) |

---

## 4. Cómo se comprobó que todo seguía igual

Se sirvieron las dos versiones con el **nginx real del NAS** (`deploy/nas/nginx.conf`, `nginx -t` correcto):
la nueva (`build/`) y la publicada (rama `conoce-y-halloween`). Después, con Playwright, en ordenador (1366 px)
y móvil (390 px):

| Prueba | Resultado |
|---|---|
| HTML de las 38 páginas (estructura, atributos, textos, JSON-LD) | 38 de 38 iguales (la 404 solo cambia `<base href="/">`, mismo destino) |
| Capturas píxel a píxel de las 38 páginas | Iguales |
| Scripts cargados y consola | Los mismos; ningún error ni bloqueo de CSP |
| Clic en todos los botones, menús, desplegables y preguntas | Mismo resultado |
| Formularios (errores, borrador, envío, datos enviados), cookies, Conoce | Iguales |
| Botón ES/EN en 13 páginas (cabecera, enlaces, textos, campos, atrás) | Igual |
| Enlaces y archivos internos (156) | Todos responden 200; redirecciones correctas |
| Clon limpio: `npm ci && npm run build` | Sin errores |
| `subir-al-nas.sh` y `volver-atras.sh` | Probados con SSH y Docker simulados |

---

## 5. Cómo se publicó (30 de octubre de 2026)

1. **Copia completa** de la carpeta de la web en el NAS: `/volume2/docker/copias-2026-10-30-antes-sveltekit`.
2. Desde el PC, en la rama `sveltekit`: `npm ci` y `bash tools/subir-al-nas.sh`.
3. Comprobado en vivo: todas las páginas ES/EN responden 200, `/sobre-mi` redirige al portfolio, cabeceras
   de seguridad y caché correctas, 404 en 3D, portada de Halloween, Conoce, cookies, botón ES/EN y
   consola sin errores. Las carpetas internas (`tools/`, `deploy/`, `.env`...) siguen ocultas.
4. Avisados los buscadores (`node tools/avisar-buscadores.js`, IndexNow aceptó las 32 páginas).
5. PR #3 juntado en `main`.

Si algo fuera mal: `bash tools/volver-atras.sh` (versión anterior) o restaurar la copia completa.

---

## 6. Lo que falta

- **Fase 2 completa:** pasar los módulos de `static/js/modules/` a componentes Svelte, uno a uno, repitiendo
  las mismas comparaciones antes de publicar cada uno.
- Después del 31 de octubre: `HALLOWEEN = false` en `src/lib/paginas/Portada.svelte`, build y subir.

Para trabajar en la web día a día, ver [`GUIA-AMPLIAR.md`](GUIA-AMPLIAR.md) y el [`README`](../README.md).
