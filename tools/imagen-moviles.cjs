/* =========================================================
   Dibuja el fondo de la página de reparación de móviles
   (escena en tools/imagen-moviles.html) y lo guarda en assets/img/moviles/.

   Uso (desde la carpeta de la web):   node tools/imagen-moviles.cjs
   Necesita Chrome (o Edge). Sin dependencias de npm.

   Salen (la escena se dibuja a cada tamaño, así queda nítida):
     fondo-N-2560.webp / fondo-N-1280.webp   cabecera en ordenador (16:9)
     fondo-N-vertical.webp                   cabecera en móvil (9:16)
     og-moviles.jpg                          imagen al compartir en redes (1200 × 630)
   Si lo vuelves a generar, sube VERSION (N) y cámbialo en src/lib/textos/moviles.js (FONDO)
   y static/css/moviles.css: Cloudflare guarda las imágenes una semana y seguiría dando las viejas.
   ========================================================= */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'static', 'assets', 'img', 'moviles');
const VERSION = 1;

const SALIDAS = [
  [`fondo-${VERSION}-2560.webp`, 'w=2560&h=1440'],
  [`fondo-${VERSION}-1280.webp`, 'w=1280&h=720'],
  [`fondo-${VERSION}-vertical.webp`, 'v=vertical&w=1080&h=1920'],
  ['og-moviles.jpg', 'w=1200&h=630']
];

function buscarChrome() {
  if (process.env.CHROME) return process.env.CHROME;
  const c = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium'
  ];
  const ok = c.find(p => fs.existsSync(p));
  if (!ok) throw new Error('No encuentro Chrome ni Edge. Indica la ruta con CHROME="..."');
  return ok;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const puerto = 9300 + Math.floor(Math.random() * 500);
  const perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'alextoll-chrome-'));
  const proc = spawn(buscarChrome(), ['--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
  try {
    let pagina;
    for (let i = 0; i < 100 && !pagina; i++) {
      await new Promise(r => setTimeout(r, 150));
      try { pagina = (await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json()).find(t => t.type === 'page'); } catch (e) { /* arrancando */ }
    }
    if (!pagina) throw new Error('Chrome no ha arrancado');
    const ws = new WebSocket(pagina.webSocketDebuggerUrl);
    await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
    let id = 0; const espera = new Map();
    ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && espera.has(d.id)) { const f = espera.get(d.id); espera.delete(d.id); d.error ? f.mal(new Error(d.error.message)) : f.ok(d.result); } };
    const enviar = (method, p = {}) => new Promise((ok, mal) => { espera.set(++id, { ok, mal }); ws.send(JSON.stringify({ id, method, params: p })); });
    const evaluar = async (expr) => (await enviar('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;

    for (const [archivo, params] of SALIDAS) {
      await enviar('Page.navigate', { url: `${pathToFileURL(path.join(__dirname, 'imagen-moviles.html')).href}?${params}` });
      await new Promise(r => setTimeout(r, 300));
      for (let i = 0; i < 300 && !(await evaluar('window.LISTO === true')); i++) await new Promise(r => setTimeout(r, 100));
      const tipo = archivo.endsWith('.jpg') ? `'image/jpeg', .88` : `'image/webp', .84`;
      const datos = await evaluar(`imagen(${tipo})`);
      const destino = path.join(OUT, archivo);
      fs.writeFileSync(destino, Buffer.from(datos.split(',')[1], 'base64'));
      console.log(`  ${path.relative(ROOT, destino)}  ${Math.round(fs.statSync(destino).size / 1024)} KB`);
    }
    ws.close();
  } finally {
    proc.kill();
    setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) { /* carpeta temporal */ } }, 800);
  }
})().catch(e => { console.error(e.message); process.exit(1); });
