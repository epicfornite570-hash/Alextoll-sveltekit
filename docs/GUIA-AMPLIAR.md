# Guía para ampliar la web de Alextoll

La web está hecha con **SvelteKit**: las páginas se escriben en `src/` con componentes
(menú, pie, cabecera...) y al compilar (`npm run build`) salen como páginas HTML normales
en la carpeta `build/`, que es lo que se sube al NAS. En el navegador no hay framework:
la parte interactiva la hacen los scripts de `static/js/` (sin dependencias), igual que antes.

- `npm run dev`: la web en `http://localhost:5173`. Al guardar un cambio, recarga la página (F5) para verlo.
- `npm run build`: genera la web completa en `build/` (nunca se edita a mano: se borra y se rehace).
- `npm run preview`: para mirar la web ya generada.

## 1. Mapa de carpetas

```
alextoll-web/
├── src/
│   ├── routes/                 UNA CARPETA POR PÁGINA (la dirección de la página)
│   │   ├── +page.svelte        Portada (index.html)
│   │   ├── +layout.js          Todas las páginas se generan como HTML estático
│   │   ├── ordenadores/        ordenadores.html
│   │   ├── webs/               webs.html
│   │   ├── reparacion-moviles/ reparacion-moviles.html
│   │   ├── diagnostico/        diagnostico.html: placa interactiva, síntomas y asesor
│   │   ├── clientes/           clientes.html: área de clientes
│   │   ├── [servicio=servicio] Las páginas de servicio (*-madrid.html), una por cada bloque de datos
│   │   ├── aviso-legal/ privacidad/ cookies/ gracias/ resena/ 404/   Páginas de texto
│   │   ├── estadisticas/       Panel privado de visitas (ver docs/ESTADISTICAS.md)
│   │   ├── sitemap.xml/        El sitemap, generado solo
│   │   └── en/                 Las páginas en inglés (computers/, web-design/, phone-screen-repair/...)
│   ├── lib/
│   │   ├── sitio.js            Dirección de la web, ficha del negocio para Google, MENÚS y textos comunes
│   │   ├── paginas/            Páginas con versión ES y EN (Portada, Ordenadores, Webs, Moviles, Servicio)
│   │   ├── textos/             LOS TEXTOS de cada página, en español y en inglés  ← para cambiar textos
│   │   ├── datos/              Páginas de servicio (paginas-servicio.js y -en.js), iconos, webs de ejemplo
│   │   └── componentes/        Piezas comunes: Cabeza (<head>), Menu, Pie, PieMini, Final (cookies + scripts),
│   │                           Conoce ("Conoce a Alextoll", la puerta al portfolio),
│   │                           Linea e Icono (iconos), mockups/ (portátil, tablet, móvil y webs de ejemplo)
│   ├── hooks.server.js         Idioma de cada página y enlaces absolutos de la 404
│   └── app.html                El esqueleto común de todas las páginas
├── static/                     SE PUBLICA TAL CUAL (lo copia el build)
│   ├── css/
│   │   ├── fonts.css           Tipografías (alojadas aquí mismo)
│   │   ├── tokens.css          COLORES, tamaños de letra, radios, sombras  ← empieza aquí
│   │   ├── base.css            Reset, botones, formularios, utilidades
│   │   ├── layout.css          Menú, pie, banner de cookies
│   │   ├── home.css            Secciones de ordenadores
│   │   ├── herramientas.css    Página diagnostico.html
│   │   ├── conoce.css          "Conoce a Alextoll": la puerta al portfolio (portada y ordenadores)
│   │   └── legal.css           Páginas de texto
│   ├── js/
│   │   ├── config.js           TUS DATOS: email, zona, formulario  ← y aquí
│   │   ├── theme-init.js       Marca que hay JavaScript antes de pintar (no tocar)
│   │   ├── data/               CONTENIDO editable, sin tocar la lógica
│   │   │   ├── servicios.js
│   │   │   ├── sintomas.js
│   │   │   ├── placa.js        Piezas de la placa base del diagnóstico
│   │   │   └── opiniones.js    Opiniones de clientes y trabajos con foto
│   │   ├── lib/
│   │   │   ├── utils.js        Funciones comunes (AT.$, AT.toast, AT.store...)
│   │   │   └── icons.js        Iconos SVG (también los usan los componentes de Svelte)
│   │   ├── modules/            Un archivo por funcionalidad (conoce.js y conoce-fondo.js: "Conoce a Alextoll")
│   │   └── main.js             Arranca los módulos en orden
│   ├── assets/
│   │   ├── fonts/              Archivos .woff2
│   │   ├── video/              Vídeos de las cabeceras (horizontal y vertical, MP4 + WebM + imagen fija)
│   │   ├── img/escenas/        Imágenes de las tarjetas (salen de tools/video)
│   │   ├── img/conoce/         Capturas del portfolio (alextoll.xyz) para "Conoce a Alextoll"
│   │   └── img/                Favicon, iconos de app, imagen para redes
│   └── robots.txt, site.webmanifest, favicon.ico, .well-known/security.txt
├── servidor/                   Contador de visitas y presupuestos de móviles (contenedor del NAS)
├── deploy/                     NAS (Docker, nginx, Cloudflare), n8n y área de clientes
├── tools/                      subir-al-nas.sh, vídeo (video/), imágenes, avisar-buscadores.js, cambiar-dominio.cjs
├── netlify/functions/          Contador de visitas antiguo de Netlify
└── docs/                       Esta guía y el informe de cambios (no se publica)
```

## 2. Tareas típicas

### Cambiar teléfono, email o zona
Edita `static/js/config.js`. El email también está escrito en las páginas (para Google):
busca `alextoll2005@gmail.com` en `src/` y sustitúyelo (después `npm run build`).

Si rellenas `zona` (por ejemplo `'Getafe y alrededores'`), aparece sola en la
cabecera, en la tarjeta de contacto y en la pregunta "¿Dónde trabajas?".

### Añadir o cambiar un servicio
En `static/js/data/servicios.js` copia un bloque `{ ... }` y cámbialo. Aparece en la lista,
en el desplegable del formulario y se puede enlazar desde síntomas y piezas.
Para mostrar precio pon `desde: 30` (sale "Desde 30 €"); `desde: null` lo oculta.

### Añadir un síntoma al diagnóstico
En `static/js/data/sintomas.js`. El campo `svc` es el `id` de un servicio.

### Cambiar lo que dice cada pieza de la placa
En `static/js/data/placa.js`. Si quieres añadir una pieza nueva al dibujo hay que tocar
el SVG de `src/lib/componentes/PlacaBase.svelte` (busca `data-part=`) y poner un grupo
`<g class="part" data-part="nombre">` con un `<rect class="hl" ...>` dentro
(el recuadro que se ilumina). `x` e `y` son coordenadas dentro del dibujo (640 × 520).

### Añadir opiniones de clientes o trabajos con fotos
En `static/js/data/opiniones.js`. Mientras las listas estén vacías, las secciones no se ven.
Las fotos van en `static/assets/img/trabajos/` (mejor en `.jpg` o `.webp`, de unos 1200 px
de ancho y menos de 300 KB). **Usa solo opiniones reales y con permiso.**

### La portada (`index.html`)
- Página: `src/lib/paginas/Portada.svelte`; textos en `src/lib/textos/portada.js` (español e inglés); estilo en `static/css/portada.css`.
- Es una entrada de marca corta: la cabecera con "Alextoll / ¿Qué necesitas?" y tres caminos:
  **Ordenadores** (`ordenadores.html`), **Webs** (`webs.html`) y **Reparación de móviles** (`reparacion-moviles.html`).
  Debajo, **"Conoce a Alextoll"**: la puerta al portfolio (ver "Quién soy: el portfolio" más abajo).
- **Fondo de la cabecera:** un vídeo generado con código, como el de ordenadores: vuelo continuo sobre un mar
  de seda plateada con pulsos de luz, montañas y el resplandor del horizonte a la derecha (la izquierda queda
  oscura para el texto). Escena: `tools/video/portal.html` (ábrela con doble clic para verla en directo; arriba
  están los ajustes). Se genera con `node tools/video/generar-video.cjs portal` (o `portal prueba` para un
  fotograma) y crea `static/assets/video/portal-3.*` (1920 × 1080), `portal-3-hd.*` (2560 × 1440, para pantallas grandes
  y retina) y `portal-3-vertical.*` (1080 × 1920), en WebM y MP4, en calidad alta,
  sin sonido, con sus pósters. `static/js/modules/video.js` descarga solo el que toca (vertical en pantallas más altas
  que 4:5) y lo muestra con un fundido. Debajo queda el póster: se ve mientras carga, si falla, sin JavaScript,
  con "reducir movimiento" o con el ahorro de datos. El velo (izquierda más oscura) está en `static/css/portada.css`
  (`.mk-hero-bg::after`). **Si lo vuelves a generar, sube el número del nombre** (`portal-4`…) en `salida`
  (generar-video.cjs), `VIDEO` (`src/lib/paginas/Portada.svelte`) y los pósters de `static/css/portada.css`: Cloudflare guarda los
  vídeos una semana y, con el mismo nombre, seguiría enseñando el viejo.
- Imágenes de las tarjetas en `static/assets/img/portada/` (sacadas de tu imagen de referencia `docs/referencia-portada.png` y
  ampliadas con IA). La tarjeta de Webs usa el portátil hecho con CSS (`src/lib/componentes/mockups/`).
- Direcciones cortas (las da nginx): `/ordenadores`, `/webs`, `/reparacion-moviles`… (con o sin barra al final).
  `/sobre-mi`, `/sobre-mi.html` y `/en/about.html` (la antigua página "Sobre mí") llevan al portfolio, https://alextoll.xyz/ (301).

### Fondo de Halloween de la portada (temporal)
- Se enciende y apaga con `HALLOWEEN` arriba de `src/lib/paginas/Portada.svelte`. Con `true` la cabecera lleva
  la calabaza 3D (`static/js/modules/calabaza-gl.js` y `calabaza-anim.js`), las ondas (`halloween.js`), ascuas y
  murciélagos (`halloween-ambiente.js`) y la niebla (`static/css/halloween.css`); el vídeo no se descarga.
- **Para volver al vídeo de siempre:** pon `HALLOWEEN = false` y vuelve a subir (`bash tools/subir-al-nas.sh`).
- Foto fija de la calabaza (se ve mientras carga o sin WebGL): `node tools/halloween/foto-calabaza.cjs`.

### La página 404 en 3D
- Página: `src/routes/404/+page.svelte`. El 3D es `static/js/modules/repara404.js` (con three.js en
  `static/js/vendor/three-0.180/`) y el estilo `static/css/repara404.css`.
- El ordenador que se monta es `static/assets/3d/pc404-N.glb`, generado con `tools/pc404/build_model.py`.
  Si lo cambias, sube el número (`pc404-3.glb`) aquí y en `repara404.js` por la caché.
- La foto del «404» que se ve mientras carga sale de `tools/foto-404.cjs`.

### La página de diseño web (`webs.html`)
- Página: `src/lib/paginas/Webs.svelte`. **Textos, precios (`PRECIOS`), planes y preguntas** están en
  `src/lib/textos/webs.js`. Estilo en `static/css/webs.css`.
- Los portátiles, tablets y móviles están hechos con HTML y CSS (no son fotos): se ven nítidos en cualquier pantalla.
  Las webs que se ven dentro son **negocios ficticios** (La Brasa, Nativa, Nord, Lumen) hechos con el componente
  `src/lib/componentes/mockups/WebEjemplo.svelte` (textos en `src/lib/datos/mockups.js`; estilos en
  `static/css/mockups.css`, compartidos con la portada).
  Cuando tengas webs reales de clientes, cámbialas en `ejemplos` (`src/lib/textos/webs.js`) y quita "Ejemplo de diseño".
- Fotos de esas webs: `static/assets/img/webs/` (sacadas de tu imagen de referencia y ampliadas con IA).
- "Ver ejemplo" abre la web de ejemplo completa en una ventana. Enlace directo para mandar por WhatsApp:
  `https://alextoll.store/webs.html#ej-brasa` (también `#ej-nativa` y `#ej-nord`).
- Ondas plateadas de la cabecera: `static/js/modules/ondas.js`. Ventanas, planes y formulario: `static/js/modules/webs.js`.
- El formulario de esta página llega a tu correo con el asunto "Web para negocio: mensaje de …".
- Imagen al compartir el enlace: `static/assets/img/og-webs.jpg`.

### Pedir reseñas en Google
- **`resena.html`**: la página que mandas al cliente al terminar un trabajo (por WhatsApp o email).
  No sale en Google ni en el menú; se enlaza desde el pie ("Déjame tu opinión") y desde `gracias.html`.
  Página en `src/routes/resena/+page.svelte`, estilo en `static/css/resena.css`.
- **Enlace de Google**: pégalo en `static/js/config.js` → `resenasGoogle` (business.google.com → "Pedir reseñas").
  Mientras esté vacío, la página ofrece solo WhatsApp.
- **Tarjetas con QR** para dar con el equipo: `docs/tarjeta-resena.html` (PDF hecho: `tarjeta-resena.pdf`).
  El QR lleva a `resena.html`, así que no hay que reimprimirlas si cambia el enlace de Google.
- En el panel de estadísticas, "Fueron a dejar reseña" cuenta quién pulsa el botón de Google.

### Quién soy: el portfolio ("Conoce a Alextoll")
Ya no hay página "Sobre mí": quién soy, mis proyectos y mi recorrido están en el portfolio, **https://alextoll.xyz/**.
En la web queda la sección **"Conoce a Alextoll"** (`#conoce`), en la portada y en ordenadores, que lleva allí.
El enlace "Sobre mí" del menú y del pie va a esa sección.
- **HTML:** `src/lib/componentes/Conoce.svelte`. **Textos** (español e inglés): `src/lib/textos/conoce.js`. Los capítulos
  (`capitulos`) usan el `id` de cada sección del portfolio (`sobre-mi`, `alextoll`, `nas`, `xtoll`).
- **Estilo:** `static/css/conoce.css`. **Movimiento:** `static/js/modules/conoce.js` (la ventana "carga" el portfolio la primera
  vez que se ve, recorre los capítulos sola y enseña el que señalas) y `static/js/modules/conoce-fondo.js` (el fondo de
  caracteres plateados, dibujado en un hilo aparte para no frenar el scroll).
- **Lo que se ve en la ventana** es el portfolio de verdad: el vídeo de su portada (`static/assets/video/portfolio-1.*`,
  1280 × 800, en bucle) y una captura de cada capítulo (`static/assets/img/conoce/<id>-1280.webp` y `-720.webp`,
  hechas a 1440 × 900). Si el portfolio cambia mucho, vuelve a hacerlas con el mismo tamaño; si cambias el vídeo,
  sube el número (`portfolio-2`) en `src/lib/textos/conoce.js` (`VIDEO`) por la caché de Cloudflare.
- En el panel de estadísticas, **"Fueron al portfolio"** cuenta los clics hacia alextoll.xyz.

### Cambiar las preguntas frecuentes
Están en `src/lib/textos/ordenadores.js` (`faq.preguntas`, español e inglés). Al compilar
van a la página y a los datos para Google (`application/ld+json`) a la vez.

### El estilo de la web (léelo antes de tocar el diseño)
La referencia es `docs/referencia-diseno.png`: **tecnología premium**, como la presentación de un
portátil o un coche de gama alta.
- **Negro, blanco, plata y grises.** Sin colores de acento: la acción principal es un botón blanco
  (`btn--primary`). El degradado plateado (`.silver`) solo en la segunda línea del titular.
- **Muy redondeado:** tarjetas con `--r-lg` (24px), campos con `--r` (14px), botones y menú en cápsula.
- **Tarjetas sólidas** (`.card`): fondo oscuro, borde finísimo y un reflejo arriba. Al pasar el
  ratón suben un poco.
- **Antetítulos** pequeños en mayúsculas (`.eyebrow`) encima de cada sección, como en la referencia.
- **Iconos de línea fina** (`AT.LINEA` en `static/js/lib/icons.js`): `AT.lsvg('lArrow')` en JavaScript,
  `<Linea k="lArrow" />` en los componentes de Svelte.
- **Movimiento suave:** los bloques entran al hacer scroll (`data-reveal`, `static/js/modules/reveal.js`)
  y el fondo de la cabecera se mueve muy despacio. Con "reducir movimiento" no se anima nada.
- **Textos:** cercanos y sin tecnicismos. Nunca datos inventados (ver "Indicadores" abajo).

### Indicadores de confianza (equipos reparados, años, garantía)
Están en `static/js/config.js`, en `confianza`. Los de equipos, años y garantía están vacíos a propósito:
pon el dato real en `valor` y aparecen solos (se ven los cuatro primeros que tengan valor).

### Trabajos reales con antes y después
En `static/js/data/opiniones.js`, `AT.TRABAJOS`, con `antes` y `despues` (rutas de dos fotos). Sale un
comparador que se arrastra. Mientras la lista esté vacía, la portada muestra huecos de ejemplo.

### Precios orientativos
Salen del campo `desde` de `static/js/data/servicios.js` (Limpieza, Sistemas operativos, Ampliación de
hardware y Reparaciones). Si está vacío, la tarjeta dice "A presupuesto".

### Imágenes de las tarjetas
Las genera `node tools/video/generar-video.cjs fotos` (lista `FOTOS` con la cámara de cada una).
Puedes sustituirlas por fotos tuyas con el mismo nombre en `static/assets/img/escenas/` (1200 × 760).

### Cambiar colores o tipografías
Todo sale de `static/css/tokens.css` (la web es siempre oscura). El color de la luz del vídeo y de las
imágenes es `--video-accent`: si lo cambias, vuelve a generarlos (ver abajo).

### Cambiar el vídeo de la cabecera de `ordenadores.html`
(El de la portada es otra escena, `tools/video/portal.html`: ver "La portada" más arriba.)
El vídeo lo genera el código de `tools/video/`: una placa base de noche con pulsos de corriente
y un barrido de diagnóstico. Se repite sin cortes cada 12 segundos.
- **Verlo en directo y retocarlo:** abre `tools/video/escena.html` con doble clic. Arriba del
  código están los colores, la cámara y la velocidad.
- **Volver a generarlo** (necesitas Chrome o Edge y [ffmpeg](https://ffmpeg.org)):
  `node tools/video/generar-video.cjs` (tarda unos 5 minutos). Con `prueba` saca solo un fotograma.
  Crea en `static/assets/video/` las versiones para ordenador (`taller.*`) y móvil (`taller-vertical.*`).
- **Poner un vídeo tuyo** (grabado o hecho con otra IA): guárdalo con esos mismos nombres
  (`taller.mp4` en 1920 × 1080 y `taller-vertical.mp4` en 720 × 1280, sin sonido, de 10 a 15 s
  y mejor por debajo de 3 MB), y la primera imagen como `taller-poster.webp` y
  `taller-vertical-poster.webp`. Si no tienes la versión `.webm`, borra las antiguas: el navegador
  usará el `.mp4`.
- El vídeo no se carga si el visitante tiene activado "reducir movimiento" o el ahorro de datos
  (se ve la imagen fija), se para cuando la cabecera no se ve y tiene botón de pausa.

### Ajustar el asesor "¿Mejorarlo o comprar otro?"
En `static/js/modules/asesor.js`: `PUNTOS` (cuánto suma o resta cada respuesta),
`pasos()` (recomendaciones) y `veredicto()` (los tres resultados posibles).

### Añadir estadísticas de visitas
1. Pon la URL del script en `statsScript` de `static/js/config.js`.
2. Añade su dominio en la `Content-Security-Policy` de `deploy/nas/nginx.conf`
   (en `script-src` y `connect-src`), o el navegador lo bloqueará.
3. Añade sus cookies a la tabla de `src/routes/cookies/+page.svelte`.

Con eso aparecerá el banner de cookies y el script solo se cargará si el visitante acepta.
Recomendadas por respetar la privacidad: GoatCounter, Plausible o Cloudflare Web Analytics.

## 3. Añadir cosas nuevas

### Una sección nueva en la página de ordenadores
1. HTML en `src/lib/paginas/Ordenadores.svelte` (y sus textos en `src/lib/textos/ordenadores.js`), con esta estructura:
   ```html
   <section class="section" id="mi-seccion" aria-labelledby="t-mi">
     <div class="wrap">
       <div class="section-head">
         <h2 id="t-mi">Título</h2>
         <p>Entradilla.</p>
       </div>
       ...
     </div>
   </section>
   ```
   Alterna `section` y `section section--tint` para que se distingan.
2. Estilos al final de `static/css/home.css` con su número de sección.
3. Si quieres que salga en el menú, añade `<li><a href="#mi-seccion">...</a></li>`
   (el LED de sección activa funciona solo).

### Una funcionalidad con JavaScript
1. Crea `static/js/modules/mi-cosa.js`:
   ```js
   window.AT = window.AT || {};
   AT.modules = AT.modules || {};
   AT.modules.miCosa = {
     init() {
       const el = AT.$('#mi-seccion'); if (!el) return; // solo actúa si existe
       ...
     }
   };
   ```
2. Cárgalo en la página: en su componente, añade `'modules/mi-cosa.js'` a `scripts` de `<Final />`
   (va antes de `main.js`).
3. Añade `'miCosa'` a la lista `ORDEN` de `static/js/main.js`.

Si un módulo falla, los demás siguen funcionando (el error sale en la consola del navegador, F12).

### Una página de servicio nueva (para salir en Google)
1. En `src/lib/datos/paginas-servicio.js` copia un bloque y cambia los textos (las instrucciones están arriba
   del archivo). Si quieres versión en inglés, añádela en `paginas-servicio-en.js` con `es:` = el slug español.
2. `npm run build`: se crea la página `<slug>.html`, se añade al sitemap y aparece en el pie de todas las páginas.

### Cambiar el menú, el pie o los textos legales
- Menú: `src/lib/sitio.js` (`MENU_MARCA` para portada y páginas legales;
  `MENU_ORDENADORES` para la parte de ordenadores; y sus versiones `_EN`).
- Pie: `src/lib/componentes/Pie.svelte` (y `PieMini.svelte`, el de la portada); sus textos en `UI` de `src/lib/sitio.js`.
- Textos legales: cada uno en su página (`src/routes/aviso-legal/+page.svelte`, `privacidad/`, `cookies/`).
- Al compilar (`npm run build`) todas las páginas salen con el menú y el pie nuevos.

### Una página nueva de otro tipo (por ejemplo "Precios" o "Blog")
1. Crea la carpeta `src/routes/precios/` con un `+page.svelte`. Para una página de texto, copia
   `src/routes/aviso-legal/+page.svelte` (usa el componente `PaginaTexto`); para una página completa,
   mira `src/routes/clientes/+page.svelte` (Cabeza, Menu, contenido, Pie y Final).
2. Añádela a `FIJAS` en `src/routes/sitemap.xml/+server.js` y enlázala desde el menú o el pie.
3. `npm run build`: sale `precios.html`.

### La versión en inglés (carpeta `en/`)
La web tiene una copia en inglés en `alextoll.store/en/`. Se entra **solo** con el botón **EN** del menú
(o el enlace "English version" del pie): nunca se cambia de idioma sola según el navegador.
- Cada archivo de `src/lib/textos/` tiene los textos en dos bloques, `es` y `en` (`TX`). Si cambias un texto
  en español, cambia también su traducción.
- Páginas en inglés: portada (`en/index.html`), ordenadores (`en/computers.html`), webs (`en/web-design.html`),
  móviles (`en/phone-screen-repair.html`) y las 10 de servicio (`src/lib/datos/paginas-servicio-en.js`, cada una con `es:` = su
  página en español).
- Las páginas que solo existen en español (diagnóstico, clientes, reseñas, legales) se enlazan desde las
  inglesas con la marca **(ES)**.
- JavaScript: `AT.t('español', 'English')` elige el texto según `<html lang>`; `AT.ruta()` pone `../` a las
  rutas de `static/assets/` en las páginas de `en/`. Servicios en inglés: `static/js/data/servicios.en.js`.
- Google: cada pareja de páginas lleva `hreflang` (lo pone `src/lib/componentes/Cabeza.svelte` con `PARES`)
  y las páginas en inglés salen solas en el sitemap.
- Para añadir otra página en inglés: pon la página en `src/lib/paginas/` con un `lang`, añade su pareja en
  `PARES` (`src/lib/sitio.js`) y crea las dos rutas (mira `src/routes/reparacion-moviles/` y `src/routes/en/phone-screen-repair/`).

## 4. Antes de subir cambios

- `npm run dev`, abre la web y pulsa **F12 → Console**: no debe haber errores en rojo.
- `npm run build`: si algo está mal escrito en `src/`, el build se para y dice el archivo y la línea.
- Prueba en modo móvil (F12 → icono de móvil): la cabecera debe cargar el vídeo vertical.
- Si cambiaste mucho una página principal, actualiza su fecha en `FIJAS` (`src/routes/sitemap.xml/+server.js`).
- Publicar: `bash tools/subir-al-nas.sh` (genera la web y la sube; ver `deploy/SUBIR-AL-NAS.md`).

## 5. Ideas para el futuro

- **Cambiar de dominio** (ahora es `alextoll.store`): `node tools/cambiar-dominio.cjs nuevodominio.es`
  lo cambia en `src/lib/sitio.js`, robots, tarjetas y nginx (después `npm run build`).
- **Ficha de Google Business** con la misma dirección/zona y teléfono: es lo que más
  clientes locales trae.
- **Precios orientativos** en `servicios.js` (`desde`): generan confianza.
- **Fotos reales de trabajos** (antes/después) en `opiniones.js`.
- **Página por servicio** (por ejemplo `cambio-ssd.html`) para posicionar en Google
  búsquedas como "cambiar disco duro por SSD + tu ciudad".
- **Reservar cita** con un calendario (Cal.com o Calendly): recuerda añadir su dominio a la CSP.
