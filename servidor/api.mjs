/* =========================================================
   Alextoll · servidor de estadísticas (para nginx)
   ---------------------------------------------------------
   Sustituye a las funciones de Netlify cuando la web está en tu
   propio servidor. Node 18 o superior, sin dependencias.

   Atiende estas direcciones (nginx le pasa todo lo que empieza por /api/):
     POST /api/visita              suma una visita o un contacto
     GET  /api/estadisticas        datos para el panel (con tu clave)
     POST /api/presupuesto-movil   presupuesto de cambio de pantalla (reparacion-moviles.html):
                                   lo revisa y se lo pasa a n8n, que te lo manda por correo con las fotos
     POST /api/contacto            formulario de contacto (ordenadores, webs): lo revisa y se lo pasa
                                   a n8n (flujo 11), que te lo manda por correo. Si no hay n8n, la web
                                   usa Web3Forms como plan B.

   Seguridad: solo se aceptan envíos con Content-Type application/json y, si el navegador
   dice de qué web viene (cabecera Origin), tiene que ser esta misma web. Así otra web no
   puede mandar formularios en nombre de sus visitantes.

   Variables de entorno:
     STATS_KEY   contraseña del panel (obligatoria para ver los datos)
     N8N_CLAVE   clave que se manda a n8n (X-Alextoll-Clave) para que sepa que el envío viene
                 de aquí. Si no está, se usa STATS_KEY (como antes)
     PORT        puerto interno (por defecto 3001)
     HOST        dirección donde escucha (por defecto 127.0.0.1; en Docker, 0.0.0.0)
     DATA_DIR    carpeta donde se guardan los datos (por defecto ./datos)
     N8N_AVISOS  (opcional) webhook de n8n al que avisar de formularios y reseñas
     N8N_PRESUPUESTOS  (opcional) webhook de n8n que manda por correo los presupuestos de móviles
     N8N_CONTACTO      (opcional) webhook de n8n que manda por correo los mensajes de contacto

   Probarlo en tu PC:
     STATS_KEY=prueba node servidor/api.mjs
   Instalarlo en el servidor: deploy/SUBIR-A-NGINX.md
   ========================================================= */
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { BOTS, registrar, igual, ultimosDias, diaVacio } from './contador.mjs';

const PORT = +process.env.PORT || 3001;
const HOST = process.env.HOST || '127.0.0.1';
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'datos'));
const CLAVE = process.env.STATS_KEY || '';
const CLAVE_N8N = process.env.N8N_CLAVE || CLAVE;
const GUARDAR_MESES = 24;           // los totales por día se borran a los 24 meses (política de privacidad)
const MAX_CUERPO = 4096;            // un aviso ocupa unos 200 bytes
const LIMITE_POR_MINUTO = 60;       // avisos por minuto y conexión (frena a quien quiera inflar los números)

await fs.mkdir(DATA_DIR, { recursive: true });

/* ---------- Guardado: un archivo por día, escrito de uno en uno ---------- */
const archivo = (dia) => path.join(DATA_DIR, `${dia}.json`);
async function leer(dia) {
  try { return JSON.parse(await fs.readFile(archivo(dia), 'utf8')); } catch { return null; }
}
let cola = Promise.resolve();
function sumar(dia, datos, ua, propio) {
  cola = cola.then(async () => {
    const nuevo = registrar(await leer(dia), datos, ua, propio);
    const tmp = archivo(dia) + '.tmp';
    await fs.writeFile(tmp, JSON.stringify(nuevo));
    await fs.rename(tmp, archivo(dia));           // escritura atómica: nunca queda un archivo a medias
  }).catch(err => console.error('[estadísticas] no se pudo guardar:', err.message));
  return cola;
}

/* Borra los días de hace más de GUARDAR_MESES meses (al arrancar y una vez al día) */
async function limpiarViejos() {
  const hoy = new Date();
  const limite = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - GUARDAR_MESES, hoy.getUTCDate())).toISOString().slice(0, 10);
  try {
    for (const nombre of await fs.readdir(DATA_DIR)) {
      const m = /^(\d{4}-\d{2}-\d{2})\.json$/.exec(nombre);
      if (m && m[1] < limite) await fs.unlink(path.join(DATA_DIR, nombre));
    }
  } catch (err) { console.error('[estadísticas] no se pudieron borrar los días viejos:', err.message); }
}
limpiarViejos();
setInterval(limpiarViejos, 86_400_000).unref();

/* Quién envía: nginx pone en X-Forwarded-For la IP real (y solo nginx llega hasta aquí).
   Solo se usa en memoria para los límites; no se guarda en ningún sitio. */
const ip = (req) => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

/* Los envíos tienen que venir de esta web y en JSON (ver arriba) */
function envioValido(req) {
  if (!/^application\/json\b/i.test(String(req.headers['content-type'] || ''))) return 415;
  const origin = req.headers.origin;
  if (origin) {
    let h = '';
    try { h = new URL(origin).host; } catch {}
    const propio = String(req.headers.host || '').replace(/^www\./, '');
    if (h.replace(/^www\./, '') !== propio) return 403;
  }
  return 0;
}

/* ---------- Límite de avisos (solo en memoria, no se guarda ninguna IP) ---------- */
const avisos = new Map();
setInterval(() => avisos.clear(), 60_000).unref();
function demasiados(req) {
  const quien = ip(req);
  const n = (avisos.get(quien) || 0) + 1;
  avisos.set(quien, n);
  return n > LIMITE_POR_MINUTO;
}

/* ---------- Avisos a n8n (formulario y reseñas → Telegram) ----------
   El del formulario lo manda /api/contacto al recibir el mensaje (se cuente o no la
   visita, que depende de que el visitante acepte las estadísticas). */
const AVISOS = process.env.N8N_AVISOS || '';
const AVISAR = ['formulario', 'resena'];
const MAX_AVISOS_HORA = 20;         // por si alguien manda avisos falsos en bucle
let avisosHora = 0;
setInterval(() => { avisosHora = 0; }, 3_600_000).unref();
function avisar(datos) {
  if (!AVISOS || !AVISAR.includes(datos.e) || ++avisosHora > MAX_AVISOS_HORA) return;
  fetch(AVISOS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Alextoll-Clave': CLAVE_N8N },
    body: JSON.stringify({ evento: datos.e, pagina: String(datos.p || '').slice(0, 200), hora: new Date().toISOString() }),
    signal: AbortSignal.timeout(5000)
  }).catch(err => console.error('[avisos] n8n no responde:', err.message));
}

/* ---------- Respuestas ---------- */
const responder = (res, status, cuerpo) => {
  res.writeHead(status, cuerpo === undefined ? { 'Cache-Control': 'no-store' }
    : { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(cuerpo === undefined ? undefined : JSON.stringify(cuerpo));
};
const leerCuerpo = (req, max = MAX_CUERPO) => new Promise((ok, mal) => {
  let t = '';
  req.setEncoding('utf8');
  req.on('data', c => { t += c; if (t.length > max) { mal(new Error('grande')); req.destroy(); } });
  req.on('end', () => ok(t));
  req.on('error', mal);
});

/* ---------- Presupuestos de móviles (reparacion-moviles.html) → n8n → correo ----------
   El navegador ya manda las fotos reducidas a JPG (1600 px). Aquí se comprueba todo
   otra vez (nunca te fíes de lo que llega de fuera) y se pasa a n8n, que manda el correo.
   Solo se contesta "ok" cuando n8n confirma que el correo ha salido. */
const PRESUPUESTOS = process.env.N8N_PRESUPUESTOS || '';
const MAX_PRESUPUESTO = 6 * 1024 * 1024;   // 3 fotos (~0,5 MB cada una en base64) + textos, con margen
const MAX_FOTO = 1.5 * 1024 * 1024;        // cada foto, ya decodificada (3 en base64 caben en MAX_PRESUPUESTO)
const MAX_FOTOS = 3;
const POR_HORA_IP = 5, POR_HORA_TOTAL = 40; // frena a quien quiera llenarte el correo
const presupuestosIp = new Map();
let presupuestosHora = 0;
setInterval(() => { presupuestosIp.clear(); presupuestosHora = 0; }, 3_600_000).unref();

const LIMITES = {   // [mínimo, máximo] de caracteres de cada campo
  nombre: [2, 80], email: [5, 120], marca: [2, 40], modelo: [2, 60], problema: [2, 80], descripcion: [0, 1500]
};
const ERRORES = {
  nombre: ['Escribe tu nombre.', 'Please enter your name.'],
  email: ['Escribe un email válido.', 'Please enter a valid email.'],
  marca: ['Escribe la marca del móvil.', 'Please enter the phone brand.'],
  modelo: ['Escribe el modelo del móvil.', 'Please enter the phone model.'],
  problema: ['Elige el tipo de problema.', 'Please choose the type of problem.'],
  descripcion: ['La descripción es demasiado larga.', 'The description is too long.'],
  fotos: ['Alguna foto no es válida o es demasiado grande. Quítala y vuelve a añadirla.', 'One of the photos is not valid or is too big. Remove it and add it again.']
};
function revisarPresupuesto(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return { error: 'nombre' };
  const limpio = {};
  for (const [k, [min, max]] of Object.entries(LIMITES)) {
    // Sin caracteres de control (la descripción puede tener saltos de línea)
    const v = String(d[k] ?? '').replace(k === 'descripcion' ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, ' ').trim();
    if (v.length < min || v.length > max) return { error: k };
    limpio[k] = v;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio.email)) return { error: 'email' };
  limpio.reparacion = /^[a-z0-9-]{1,30}$/.test(d.reparacion) ? d.reparacion : 'pantalla';
  limpio.idioma = d.idioma === 'en' ? 'en' : 'es';
  const fotos = Array.isArray(d.fotos) ? d.fotos : [];
  if (fotos.length > MAX_FOTOS) return { error: 'fotos' };
  limpio.fotos = [];
  for (const f of fotos) {
    const b = Buffer.from(String(f?.datos || ''), 'base64');
    // Tiene que ser un JPG de verdad (empieza por FF D8 FF) y no pasarse de tamaño
    if (b.length < 100 || b.length > MAX_FOTO || b[0] !== 0xff || b[1] !== 0xd8 || b[2] !== 0xff) return { error: 'fotos' };
    limpio.fotos.push({ nombre: String(f.nombre || 'foto.jpg').replace(/[^\w .-]/g, '_').slice(0, 80), datos: b.toString('base64') });
  }
  return { limpio };
}

async function presupuesto(req, res) {
  if (req.method !== 'POST') return responder(res, 405);
  if (!PRESUPUESTOS) return responder(res, 503, { error: 'sin-correo' });
  let d;
  try { d = JSON.parse(await leerCuerpo(req, MAX_PRESUPUESTO)); } catch { return responder(res, 413, { error: 'grande' }); }
  /* Robots: campo trampa relleno o formulario enviado en menos de 3 segundos.
     Se les dice que ha ido bien para que no insistan, pero no se manda nada. */
  if (d && (d.empresa || +d.ms < 3000)) return responder(res, 200, { ok: true });
  const quien = ip(req);
  const n = (presupuestosIp.get(quien) || 0) + 1;
  presupuestosIp.set(quien, n);
  if (n > POR_HORA_IP || ++presupuestosHora > POR_HORA_TOTAL) return responder(res, 429, { error: 'muchas' });
  const { error, limpio } = revisarPresupuesto(d);
  if (error) return responder(res, 400, { error: 'datos', campo: error, mensaje: ERRORES[error][0], message: ERRORES[error][1] });
  try {
    const r = await fetch(PRESUPUESTOS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Alextoll-Clave': CLAVE_N8N },
      body: JSON.stringify({ ...limpio, hora: new Date().toISOString() }),
      signal: AbortSignal.timeout(45000)
    });
    if (!r.ok) throw new Error(`n8n respondió ${r.status}`);
    return responder(res, 200, { ok: true });
  } catch (err) {
    console.error('[presupuestos] no se ha podido mandar:', err.message);
    return responder(res, 502, { error: 'correo' });
  }
}

/* ---------- Mensajes del formulario de contacto → n8n (flujo 11) → correo ---------- */
const CONTACTO = process.env.N8N_CONTACTO || '';
const MAX_CONTACTO = 8 * 1024;
const CONTACTO_IP_HORA = 5, CONTACTO_HORA = 40;
const contactoIp = new Map();
let contactoHora = 0;
setInterval(() => { contactoIp.clear(); contactoHora = 0; }, 3_600_000).unref();
const CAMPOS_CONTACTO = { nombre: [2, 80], contacto: [5, 120], servicio: [0, 80], mensaje: [10, 1500], asunto: [0, 80] };
const ERRORES_CONTACTO = {
  nombre: ['Escribe tu nombre.', 'Please enter your name.'],
  contacto: ['Pon un teléfono (9 cifras) o un email válido.', 'Please enter a phone number (9+ digits) or a valid email.'],
  servicio: ['Elige un servicio de la lista.', 'Please choose a service from the list.'],
  mensaje: ['Cuéntame un poco más (mínimo 10 caracteres).', 'Tell me a bit more (at least 10 characters).'],
  asunto: ['El asunto es demasiado largo.', 'The subject is too long.']
};
function revisarContacto(d) {
  if (!d || typeof d !== 'object' || Array.isArray(d)) return { error: 'nombre' };
  const limpio = {};
  for (const [k, [min, max]] of Object.entries(CAMPOS_CONTACTO)) {
    const v = String(d[k] ?? '').replace(k === 'mensaje' ? /[\u0000-\u0009\u000b-\u001f\u007f]/g : /[\u0000-\u001f\u007f]/g, ' ').trim();
    if (v.length < min || v.length > max) return { error: k };
    limpio[k] = v;
  }
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpio.contacto);
  const telefono = /^\+?[\d\s-]{9,}$/.test(limpio.contacto) && limpio.contacto.replace(/\D/g, '').length >= 9;
  if (!email && !telefono) return { error: 'contacto' };
  limpio.email = email ? limpio.contacto : '';
  limpio.idioma = d.idioma === 'en' ? 'en' : 'es';
  limpio.pagina = String(d.pagina || '').replace(/[^\w\-./]/g, '').slice(0, 120);
  return { limpio };
}

async function contacto(req, res) {
  if (req.method !== 'POST') return responder(res, 405);
  /* Sin n8n configurado: la web lo manda por Web3Forms (plan B) */
  if (!CONTACTO) return responder(res, 503, { error: 'sin-correo' });
  let d;
  try { d = JSON.parse(await leerCuerpo(req, MAX_CONTACTO)); } catch { return responder(res, 413, { error: 'grande' }); }
  /* Robots: campo trampa relleno o enviado en menos de 3 segundos desde que se abrió la página.
     Se les dice que ha ido bien para que no insistan, pero no se manda nada. */
  if (d && (d.empresa || +d.ms < 3000)) return responder(res, 200, { ok: true });
  const quien = ip(req);
  const n = (contactoIp.get(quien) || 0) + 1;
  contactoIp.set(quien, n);
  if (n > CONTACTO_IP_HORA || ++contactoHora > CONTACTO_HORA) return responder(res, 429, { error: 'muchas' });
  const { error, limpio } = revisarContacto(d);
  if (error) return responder(res, 400, { error: 'datos', campo: error, mensaje: ERRORES_CONTACTO[error][0], message: ERRORES_CONTACTO[error][1] });
  try {
    const r = await fetch(CONTACTO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Alextoll-Clave': CLAVE_N8N },
      body: JSON.stringify({ ...limpio, hora: new Date().toISOString() }),
      signal: AbortSignal.timeout(30000)
    });
    if (!r.ok) throw new Error(`n8n respondió ${r.status}`);
    avisar({ e: 'formulario', p: limpio.pagina });
    return responder(res, 200, { ok: true });
  } catch (err) {
    console.error('[contacto] no se ha podido mandar:', err.message);
    return responder(res, 502, { error: 'correo' });
  }
}

const servidor = http.createServer(async (req, res) => {
  try { await atender(req, res); }
  catch (err) {
    console.error('[api] error inesperado:', err.message);
    if (!res.headersSent) responder(res, 500, { error: 'interno' }); else res.end();
  }
});

async function atender(req, res) {
  const url = new URL(req.url, 'http://localhost');

  /* Envíos: solo JSON y desde esta misma web */
  if (req.method === 'POST') {
    const malo = envioValido(req);
    if (malo) return responder(res, malo, { error: malo === 415 ? 'tipo' : 'origen' });
  }

  /* Sumar una visita o un contacto */
  if (url.pathname === '/api/visita') {
    if (req.method !== 'POST') return responder(res, 405);
    const ua = String(req.headers['user-agent'] || '');
    if (BOTS.test(ua) || demasiados(req)) return responder(res, 204);
    let datos;
    try { datos = JSON.parse(await leerCuerpo(req)); } catch { return responder(res, 400); }
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) return responder(res, 400);
    const propio = String(req.headers.host || '').split(':')[0].replace(/^www\./, '');
    await sumar(new Date().toISOString().slice(0, 10), datos, ua, propio);
    /* El aviso del formulario lo manda /api/contacto; aquí solo el de las reseñas */
    if (datos.e !== 'formulario') avisar(datos);
    return responder(res, 204);
  }

  /* Mensaje del formulario de contacto */
  if (url.pathname === '/api/contacto') return contacto(req, res);

  /* Presupuesto de cambio de pantalla (reparacion-moviles.html) */
  if (url.pathname === '/api/presupuesto-movil') return presupuesto(req, res);

  /* Datos para el panel */
  if (url.pathname === '/api/estadisticas') {
    if (req.method !== 'GET') return responder(res, 405);
    if (!CLAVE) return responder(res, 500, { error: 'falta-clave' });
    if (!igual(String(req.headers.authorization || ''), `Bearer ${CLAVE}`)) return responder(res, 401, { error: 'clave-incorrecta' });
    const n = Math.min(90, Math.max(1, parseInt(url.searchParams.get('dias'), 10) || 30));
    const dias = await Promise.all(ultimosDias(n).map(async dia => ({ dia, ...diaVacio(), ...(await leer(dia) || {}) })));
    return responder(res, 200, { dias });
  }

  responder(res, 404, { error: 'no-existe' });
}

servidor.listen(PORT, HOST, () => {
  console.log(`Estadísticas de Alextoll en http://${HOST}:${PORT} (datos en ${DATA_DIR})${CLAVE ? '' : ' · AVISO: falta STATS_KEY, el panel no mostrará datos'}`);
});
