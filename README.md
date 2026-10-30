# Alextoll · Reparación y mejora de ordenadores en Madrid

Web de mi servicio técnico: limpieza, reparaciones, ampliación de RAM y SSD, instalación de Windows y
Linux, diseño web y reparación de móviles. Hecha con **SvelteKit** (páginas estáticas generadas al compilar),
CSS propio y JavaScript sin dependencias en el navegador. Se publica en un NAS propio con Docker y Cloudflare Tunnel.

![Fondo de la portada: un mar de seda plateada con luz en el horizonte](static/assets/video/portal-3-poster.webp)

**Web:** https://alextoll.store

> Copia pública del código, sin historial y sin documentos personales ni de gestión del negocio
> (bots de n8n, informes, cartel, tarjetas...). Se actualiza de vez en cuando desde el repositorio privado.

## Qué tiene

- **Placa base interactiva** en SVG: pulsas una pieza (RAM, SSD, ventilador...) y te explica qué suele
  fallar y cómo se arregla.
- **Diagnóstico por síntomas** y **asesor "¿mejorarlo o comprar otro?"**, que rellenan el formulario de
  contacto con lo que ha elegido el visitante.
- **Formulario** con Netlify Forms: validación, borrador guardado y alternativa por WhatsApp si falla.
- **Páginas por servicio** pensadas para Google (cambiar a SSD, ampliar RAM, formatear...), generadas desde
  un archivo de datos.
- **"Conoce a Alextoll"**: la puerta al portfolio (https://alextoll.xyz/), con una ventana que enseña cada sección.
- **Estadísticas propias sin cookies**: Netlify Functions + Netlify Blobs y un panel privado con clave.
- **Vídeo de fondo generado por código** (placa base con pulsos de corriente, bucle sin cortes de 12 s),
  con versión para móvil, pausa y respeto a "reducir movimiento" y al ahorro de datos.
- Diseño premium en negro, blanco y plata, con menú flotante de cristal y tarjetas tipo producto.
- Diagnóstico rápido online (`diagnostico.html`): placa interactiva, síntomas y asesor de mejoras.

## Tecnología

| | |
|---|---|
| Páginas | SvelteKit + Svelte 5 (`adapter-static`): cada página se genera como HTML estático |
| Navegador | CSS (variables, grid) y JavaScript en módulos (`window.AT`), sin dependencias |
| Formularios | Netlify Forms |
| Estadísticas | Netlify Functions (`netlify/functions/`) + Netlify Blobs |
| Tipografía | Archivo y JetBrains Mono, alojadas en la propia web |
| Iconos | Phosphor Icons (MIT) |
| Seguridad | Content-Security-Policy y cabeceras en `netlify.toml` |

## Estructura

```
src/
  routes/                          Una carpeta por página (ordenadores/, webs/, en/computers/...)
  lib/paginas/                     Las páginas que tienen versión en español y en inglés (Portada, Ordenadores...)
  lib/componentes/                 Piezas comunes: Cabeza (<head>), Menu, Pie, Final (cookies y scripts), iconos...
  lib/textos/                      Los textos de cada página, en español y en inglés
  lib/datos/                       Páginas de servicio, iconos y webs de ejemplo de los mockups
  lib/sitio.js                     Dirección, ficha del negocio para Google, menús y textos comunes
  hooks.server.js                  Idioma de cada página y enlaces absolutos de la 404
static/                            Se publica tal cual: assets/ (imágenes, vídeo, fuentes), css/, js/, robots.txt...
  js/config.js                     Datos de contacto y opciones
  js/data/                         Contenido editable: servicios, síntomas, piezas, proyectos...
  js/modules/                      Una funcionalidad por archivo
servidor/                          Contador de visitas y presupuestos de móviles (contenedor del NAS)
deploy/                            NAS (Docker, nginx, Cloudflare), n8n y área de clientes (Firebase)
tools/                             Subir al NAS, vídeo de fondo, imágenes y avisar a los buscadores
docs/                              Guías (no se publica)
```

## Trabajar en local

```bash
npm install        # la primera vez
npm run dev        # la web en http://localhost:5173 (al guardar un cambio, recarga la página)
npm run build      # genera la web completa en build/
npm run preview    # mira la web generada
```

Las páginas se cambian en `src/` (textos en `src/lib/textos/`). Nunca se edita `build/`: se borra y se
vuelve a generar cada vez.

## Publicar

`bash tools/subir-al-nas.sh` genera la web y la sube al NAS (ver `deploy/SUBIR-AL-NAS.md`). Después,
`git commit` y `git push` a GitHub.

## Documentación

- [`docs/GUIA-AMPLIAR.md`](docs/GUIA-AMPLIAR.md): cómo está organizada y cómo ampliarla.
- [`docs/MIGRACION-SVELTEKIT.md`](docs/MIGRACION-SVELTEKIT.md): cómo se pasó la web a SvelteKit (oct 2026), paso a paso.
- [`docs/ESTADISTICAS.md`](docs/ESTADISTICAS.md): el contador de visitas.

---

© 2026 Alejandro Martín Rodríguez (Alextoll). El código es de libre consulta como portfolio; los textos,
el diseño y la marca no se pueden reutilizar sin permiso.
