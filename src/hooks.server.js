/* Ajustes de cada página al generarla:
   - Idioma en <html>: las páginas en inglés están en /en/ y sus rutas a assets/, css/ y js/
     llevan delante '../' (data-raiz lo usan los scripts de static/js).
   - 404.html: nginx la sirve en cualquier dirección que no existe (p. ej. /algo/mal), así que lleva
     <base href="/"> lo primero del <head>: sus enlaces y archivos se buscan siempre desde la raíz. */

export async function handle({ event, resolve }) {
  const p = event.url.pathname, en = p === '/en' || p.startsWith('/en/');
  return resolve(event, {
    transformPageChunk: ({ html }) => html
      .replace('%alx.lang%', en ? 'en' : 'es')
      .replace('%alx.raiz%', en ? ' data-raiz="../"' : '')
      .replace('<head>', p === '/404' ? '<head>\n<base href="/">' : '<head>')
  });
}
