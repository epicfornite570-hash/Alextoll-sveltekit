/* Las páginas se enlazan con su nombre de archivo de siempre (ordenadores.html, en/index.html...).
   Al generar la web cada ruta ya sale con ese nombre; esto hace que también funcionen
   con npm run dev, donde no hay archivos sino rutas (/ordenadores, /en/). */
export function reroute({ url }) {
  const p = url.pathname;
  if (p.endsWith('/index.html')) return p.slice(0, -'index.html'.length);
  if (p.endsWith('.html')) return p.slice(0, -'.html'.length);
}
