/* =========================================================
   sitemap.xml: las páginas que Google debe conocer. Se genera al compilar.
   - FIJAS: páginas principales con la fecha de su último cambio importante
     (cámbiala a mano cuando cambies mucho una página).
   - Las páginas de servicio (ES) y todas las páginas en inglés salen solas de
     src/lib/datos/paginas-servicio*.js, con la fecha del día en que se compila.
   ========================================================= */
import { PARES, publica } from '$lib/sitio.js';
import PAGINAS from '$lib/datos/paginas-servicio.js';
import PAGINAS_EN from '$lib/datos/paginas-servicio-en.js';

export const prerender = true;

const FIJAS = [
  ['index.html', '2026-10-10', '1.0'],
  ['ordenadores.html', '2026-10-04', '1.0'],
  ['webs.html', '2026-10-10', '0.9'],
  ['reparacion-moviles.html', '2026-10-12', '0.9'],
  ['diagnostico.html', '2026-10-03', '0.7'],
  ['aviso-legal.html', '2026-10-02', '0.3'],
  ['privacidad.html', '2026-10-02', '0.3'],
  ['cookies.html', '2026-10-02', '0.3']
];

export function GET() {
  const hoy = new Date().toISOString().slice(0, 10);
  const url = ([p, fecha, prioridad]) => `  <url><loc>${publica(p)}</loc><lastmod>${fecha}</lastmod><priority>${prioridad}</priority></url>`;
  const lineas = [
    ...FIJAS.map(url),
    ...PAGINAS.map(p => url([`${p.slug}.html`, hoy, '0.8'])),
    ...[[PARES.portada.en, '0.9'], [PARES.ordenadores.en, '0.9'], [PARES.webs.en, '0.8'], [PARES.moviles.en, '0.8'],
      ...PAGINAS_EN.map(p => [`en/${p.slug}.html`, '0.7'])].map(([p, pr]) => url([p, hoy, pr]))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${lineas.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
