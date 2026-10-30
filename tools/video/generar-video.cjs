/* =========================================================
   Genera el vídeo de fondo de la cabecera (assets/video/)
   ---------------------------------------------------------
   Abre la escena en Chrome sin ventana, saca cada fotograma y
   monta los vídeos con ffmpeg. Sin dependencias de npm.
   Hay dos escenas:
   - taller (tools/video/escena.html): la placa base de ordenadores.html
   - portal (tools/video/portal.html): el mar de seda plateada de la portada

   Necesitas:
   - Node 22 o superior
   - Google Chrome o Microsoft Edge instalado
   - ffmpeg (https://ffmpeg.org). Si no está en el PATH, indica dónde:
       FFMPEG="C:\ruta\ffmpeg.exe" node tools/video/generar-video.cjs

   Uso (desde la carpeta de la web). Sin nombre de escena, es la del taller;
   para la portada pon "portal" delante (node tools/video/generar-video.cjs portal prueba):
     node tools/video/generar-video.cjs              los dos encuadres
     node tools/video/generar-video.cjs horizontal   solo el de ordenador
     node tools/video/generar-video.cjs vertical     solo el de móvil
     node tools/video/generar-video.cjs prueba       un fotograma de cada, para mirar
     node tools/video/generar-video.cjs fotos        las imágenes de las tarjetas (assets/img/escenas/)

   El color de la luz se lee de static/css/tokens.css (--video-accent): si lo cambias,
   vuelve a generar el vídeo y combinará con la web.
   ========================================================= */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', '..');
const OUT = path.join(ROOT, 'static', 'assets', 'video');
const FPS = 30;
const SUPER = 1.5;            // se dibuja más grande y se reduce: líneas finas sin dientes
                              // (cada encuadre puede pedir otro con "super")

/* Escenas: archivo, nombre de salida en assets/video/, duración (igual que SEGUNDOS
   en su HTML) y tamaño de cada encuadre. Un encuadre puede sacar varios tamaños de los
   mismos fotogramas ("salidas"); crf más bajo = más calidad y más peso. */
const ESCENAS = {
  taller: {
    archivo: 'escena.html', salida: 'taller', segundos: 12,
    encuadres: {
      horizontal: { w: 1920, h: 1080, sufijo: '',          crf264: 26, crfvp9: 36 },
      vertical:   { w: 720,  h: 1280, sufijo: '-vertical', crf264: 26, crfvp9: 36 }
    }
  },
  portal: {
    // Al volver a generarlo, sube el número (portal-4...) y cámbialo en src/lib/paginas/Portada.svelte (VIDEO)
    // y static/css/portada.css: Cloudflare guarda los vídeos una semana y seguiría dando el viejo.
    archivo: 'portal.html', salida: 'portal-3', segundos: 12,
    encuadres: {
      // Ordenador: se dibuja a 3840 × 2160 y salen dos tamaños: -hd (2560 × 1440, pantallas
      // grandes y retina) y el normal (1920 × 1080). Calidad alta: las líneas finas se ven nítidas.
      horizontal: { w: 2560, h: 1440, super: 1.5, salidas: [
        { w: 2560, h: 1440, sufijo: '-hd', crf264: 23, crfvp9: 32, poster: false },
        { w: 1920, h: 1080, sufijo: '',    crf264: 22, crfvp9: 31 }
      ] },
      // Móvil: se dibuja al doble (2160 × 3840) y se reduce a 1080 × 1920
      vertical: { w: 1080, h: 1920, super: 2, salidas: [
        { w: 1080, h: 1920, sufijo: '-vertical', crf264: 24, crfvp9: 33 }
      ] }
    }
  }
};
let ESC = ESCENAS.taller;
const ESCENA = () => path.join(__dirname, ESC.archivo);

/* Fotos fijas de la misma placa, con la cámara colocada a mano:
   cam = x, y, altura, inclinación hacia abajo, giro (positivo = derecha), campo de visión */
const FOTOS = [
  { nombre: 'reparacion',  cam: '-3.2,-1,3.4,22,-30,40', p: .05, w: 1200, h: 760 },
  { nombre: 'ssd-ram',     cam: '1.5,-5,8,36,24,40',     p: .15, w: 1200, h: 760 },
  { nombre: 'limpieza',    cam: '-8.6,-3,3.2,14,-6,44',  p: .12, w: 1200, h: 760, polvo: 5 },
  { nombre: 'sistema',     cam: '0,0,4.2,6,0,40',        p: .5,  w: 1200, h: 760 },
  { nombre: 'sobre-mi',    cam: '-6,0,5.2,8,-16,44',     p: .7,  w: 1600, h: 1000, polvo: 2 },
  { nombre: 'diagnostico', cam: '1,0,5,10,-4,42',        p: .42, w: 1600, h: 900 }
];

/* ---------- Programas necesarios ---------- */
function buscarChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const c = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
  ];
  const ok = c.find(p => fs.existsSync(p));
  if (!ok) throw new Error('No encuentro Chrome ni Edge. Indica la ruta con CHROME="..."');
  return ok;
}
function buscarFfmpeg() {
  const exe = process.env.FFMPEG || 'ffmpeg';
  const r = spawnSync(exe, ['-version'], { stdio: 'ignore' });
  if (r.error) throw new Error('No encuentro ffmpeg. Instálalo o indica la ruta con FFMPEG="..."');
  return exe;
}
function acento() {
  const css = fs.readFileSync(path.join(ROOT, 'static', 'css', 'tokens.css'), 'utf8');
  const m = css.match(/--video-accent:\s*#([0-9a-f]{6})/i) || css.match(/--accent:\s*#([0-9a-f]{6})/i);
  return m ? m[1] : 'DCE2EA';
}

/* ---------- Chrome por el protocolo de depuración ---------- */
async function abrirChrome() {
  const puerto = 9300 + Math.floor(Math.random() * 500);
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'alextoll-chrome-'));
  const proc = spawn(buscarChrome(), [
    '--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio',
    '--allow-file-access-from-files', 'about:blank'
  ], { stdio: 'ignore' });

  let pagina;
  for (let i = 0; i < 100 && !pagina; i++) {
    await new Promise(r => setTimeout(r, 150));
    try {
      const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
      pagina = lista.find(t => t.type === 'page');
    } catch (e) { /* aún arrancando */ }
  }
  if (!pagina) { proc.kill(); throw new Error('Chrome no ha arrancado'); }

  const ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let id = 0;
  const espera = new Map(), eventos = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && espera.has(d.id)) { const { ok, mal } = espera.get(d.id); espera.delete(d.id); d.error ? mal(new Error(d.error.message)) : ok(d.result); }
    else if (d.method && eventos.has(d.method)) { eventos.get(d.method)(d.params); eventos.delete(d.method); }
  };
  const enviar = (method, params = {}) => new Promise((ok, mal) => { espera.set(++id, { ok, mal }); ws.send(JSON.stringify({ id, method, params })); });
  const evento = (method) => new Promise(ok => eventos.set(method, ok));

  return {
    async ir(url) { await enviar('Page.enable'); const cargada = evento('Page.loadEventFired'); await enviar('Page.navigate', { url }); await cargada; },
    async evaluar(expr) {
      const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
      return r.result.value;
    },
    cerrar() { try { ws.close(); } catch (e) {} proc.kill(); setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch (e) { /* Windows a veces lo tiene bloqueado: es una carpeta temporal */ } }, 800); }
  };
}

/* ---------- Un encuadre: fotogramas + vídeos + póster ---------- */
async function generar(nombre, { prueba = false } = {}) {
  const e = ESC.encuadres[nombre];
  const k = e.super || SUPER;
  const w = Math.round(e.w * k), h = Math.round(e.h * k);
  const url = `${pathToFileURL(ESCENA()).href}?render&v=${nombre}&w=${w}&h=${h}&accent=${acento()}`;
  const chrome = await abrirChrome();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `alextoll-${nombre}-`));
  const total = prueba ? 1 : FPS * ESC.segundos;
  try {
    await chrome.ir(url);
    const t0 = Date.now();
    for (let i = 0; i < total; i++) {
      const p = prueba ? .4 : i / total;                // el último fotograma no repite el primero
      const datos = await chrome.evaluar(`ESCENA.fotograma(${p})`);
      fs.writeFileSync(path.join(tmp, `f${String(i).padStart(5, '0')}.png`), Buffer.from(datos.split(',')[1], 'base64'));
      if (!prueba && (i % 30 === 29 || i === total - 1)) {
        const s = (Date.now() - t0) / 1000, falta = s / (i + 1) * (total - i - 1);
        process.stdout.write(`\r  ${nombre}: fotograma ${i + 1}/${total} (faltan ${Math.ceil(falta)} s)   `);
      }
    }
  } finally { chrome.cerrar(); }

  fs.mkdirSync(OUT, { recursive: true });
  const ff = buscarFfmpeg();
  const correr = (args) => { const r = spawnSync(ff, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { stdio: 'inherit' }); if (r.status) throw new Error('ffmpeg ha fallado'); };
  const entrada = ['-framerate', String(FPS), '-i', path.join(tmp, 'f%05d.png')];

  for (const s of e.salidas || [e]) {
    const escala = `scale=${s.w}:${s.h}:flags=lanczos`;
    const base = path.join(OUT, `${ESC.salida}${s.sufijo}`);
    if (prueba) {
      correr([...entrada, '-vf', escala, '-frames:v', '1', `${base}-prueba.png`]);
      continue;
    }
    console.log(`\n  ${nombre} ${s.w}×${s.h}: montando MP4, WebM${s.poster === false ? '' : ' y póster'}...`);
    correr([...entrada, '-vf', `${escala},format=yuv420p`, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(s.crf264), '-profile:v', 'high', '-g', String(FPS * 2), '-movflags', '+faststart', '-an', `${base}.mp4`]);
    correr([...entrada, '-vf', `${escala},format=yuv420p`, '-c:v', 'libvpx-vp9', '-crf', String(s.crfvp9), '-b:v', '0', '-row-mt', '1', '-tile-columns', '2', '-deadline', 'good', '-cpu-used', '1', '-g', String(FPS * 2), '-an', `${base}.webm`]);
    const exts = ['.mp4', '.webm'];
    if (s.poster !== false) {
      correr(['-i', path.join(tmp, 'f00000.png'), '-vf', escala, '-c:v', 'libwebp', '-quality', '80', '-frames:v', '1', `${base}-poster.webp`]);
      exts.push('-poster.webp');
    }
    for (const ext of exts) {
      const kb = Math.round(fs.statSync(base + ext).size / 1024);
      console.log(`  ${path.relative(ROOT, base + ext)}  ${kb} KB`);
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

async function fotos() {
  const dir = path.join(ROOT, 'static', 'assets', 'img', 'escenas');
  fs.mkdirSync(dir, { recursive: true });
  const ff = buscarFfmpeg();
  for (const f of FOTOS) {
    const chrome = await abrirChrome();
    try {
      const w = Math.round(f.w * SUPER), h = Math.round(f.h * SUPER);
      await chrome.ir(`${pathToFileURL(ESCENA()).href}?render&w=${w}&h=${h}&accent=${acento()}&cam=${f.cam}&polvo=${f.polvo || 1}`);
      const datos = await chrome.evaluar(`ESCENA.fotograma(${f.p})`);
      const png = path.join(os.tmpdir(), `alextoll-foto-${f.nombre}.png`);
      fs.writeFileSync(png, Buffer.from(datos.split(',')[1], 'base64'));
      const out = path.join(dir, `${f.nombre}.webp`);
      const r = spawnSync(ff, ['-y', '-hide_banner', '-loglevel', 'error', '-i', png, '-vf', `scale=${f.w}:${f.h}:flags=lanczos`, '-c:v', 'libwebp', '-quality', '80', out], { stdio: 'inherit' });
      if (r.status) throw new Error('ffmpeg ha fallado');
      fs.rmSync(png, { force: true });
      console.log(`  ${path.relative(ROOT, out)}  ${Math.round(fs.statSync(out).size / 1024)} KB`);
    } finally { chrome.cerrar(); }
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (ESCENAS[args[0]]) ESC = ESCENAS[args.shift()];
  const ENCUADRES = ESC.encuadres;
  const arg = args[0] || 'todos';
  if (arg === 'fotos') { await fotos(); console.log('Listo.'); return; }
  const prueba = arg === 'prueba';
  const lista = prueba || arg === 'todos' ? Object.keys(ENCUADRES) : [arg];
  if (!lista.every(n => ENCUADRES[n])) { console.error('Usa: horizontal, vertical, todos o prueba'); process.exit(1); }
  for (const n of lista) await generar(n, { prueba });
  console.log(prueba ? 'Fotogramas de prueba en assets/video/*-prueba.png (bórralos al terminar).' : 'Listo.');
})().catch(err => { console.error('\n' + err.message); process.exit(1); });
