/* =========================================================
   Lógica del contador de visitas (compartida)
   ---------------------------------------------------------
   La usan el servidor propio (servidor/api.mjs, para nginx)
   y las funciones de Netlify (netlify/functions), para que
   las dos versiones cuenten exactamente igual.

   Privacidad: no usa cookies, no guarda la IP ni nada que identifique
   a la persona. Solo suma contadores por día:
     visitas, páginas, de dónde llegan, móvil/escritorio y contactos.
   ========================================================= */
export const BOTS = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|curl|wget/i;
export const EVENTOS = ['whatsapp', 'llamada', 'email', 'formulario', 'resena', 'portfolio'];

/* Nombre legible del sitio de procedencia */
export function origen(referrer, propio) {
  if (!referrer) return 'Directo';
  let h;
  try { h = new URL(referrer).hostname.replace(/^www\./, ''); } catch { return 'Directo'; }
  if (!h || h === propio) return null; // navegación dentro de la web: no es una procedencia
  if (/(^|\.)google\./.test(h)) return 'Google';
  if (/(^|\.)bing\.com$/.test(h)) return 'Bing';
  if (/duckduckgo\.com$/.test(h)) return 'DuckDuckGo';
  if (/(^|\.)(instagram|l\.instagram)\.com$/.test(h)) return 'Instagram';
  if (/(^|\.)(facebook|m\.facebook|l\.facebook)\.com$/.test(h)) return 'Facebook';
  if (/wa\.me$|whatsapp\.com$/.test(h)) return 'WhatsApp';
  if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(h)) return 'X (Twitter)';
  return h.slice(0, 60);
}

/* Ruta de la página, limpia y corta */
export function pagina(p) {
  let ruta = String(p || '/').split(/[?#]/)[0].slice(0, 120);
  ruta = ruta.replace(/[^\w\-./]/g, '');
  if (ruta === '' || ruta === '/index.html') ruta = '/';
  return ruta;
}

/* Día vacío */
export const diaVacio = () => ({ visitas: 0, paginas: {}, origenes: {}, dispositivos: {}, eventos: {} });

/* Suma un aviso a los contadores del día */
export function registrar(dia, { p, r, e }, ua, propio) {
  const d = dia || diaVacio();
  const inc = (obj, k) => { obj[k] = (obj[k] || 0) + 1; };
  if (e) {
    if (EVENTOS.includes(e)) inc(d.eventos, e);
    return d;
  }
  d.visitas += 1;
  inc(d.paginas, pagina(p));
  const o = origen(r, propio);
  if (o) inc(d.origenes, o);
  inc(d.dispositivos, /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Móvil' : 'Escritorio');
  return d;
}

/* Compara la clave sin delatar por el tiempo de respuesta cuánto se ha acertado */
export function igual(a, b) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/* Lista de fechas (AAAA-MM-DD) de los últimos n días, de la más antigua a hoy */
export function ultimosDias(n, hoy = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - i));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
