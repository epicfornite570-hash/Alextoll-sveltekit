/* =========================================================
   Saca la foto del «404» cromado que se ve mientras carga el 3D
   (static/assets/img/404-cromo-movil-N.webp y 404-cromo-pc-N.webp).

   Uso: con la web servida en http://localhost:8765 (npm run build y luego: python3 -m http.server 8765 -d build)
        npx -y -p playwright node tools/foto-404.cjs
   Rehazla si cambias el «404» en static/js/modules/repara404.js o los huecos en static/css/repara404.css.
   El recorte es la base del 3D (3.6 × 1.75) con margen: MX/MY deben cuadrar con .r4-foto
   (ancho = base × (1 + 2·MX)) y la foto debe tener el aspecto 3.6·(1+2MX) : 1.75·(1+2MY).
   ========================================================= */
const fs = require('fs');
const { chromium } = require('playwright');
const MX = 0.03, MY = 0.2;
const VERSION = 2; // súbela al rehacer la foto (Cloudflare guarda las imágenes una semana) y cámbiala en src/routes/404/+page.svelte
const WEB = process.env.WEB || 'http://localhost:8765';

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [nombre, ancho] of [['movil', 390], ['pc', 1280]]) {
    const ctx = await b.newContext({ viewport: { width: ancho, height: 900 }, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    // el 3D se congela en el primer cuadro (el «404» en reposo, igual que cuando sustituye a la foto)
    await p.addInitScript(() => {
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (f) => { const r = document.getElementById('r4'); return r && r.classList.contains('r4-3d') ? 0 : raf(f); };
    });
    await p.goto(`${WEB}/404.html`);
    await p.addStyleTag({ content: 'html,body,main,.page,section,div{background:transparent!important} body::before,body::after{display:none!important} .r4h-txt > *:not(.r4-hueco),header,nav,.r4-hueco-pc *,.r4-foto{visibility:hidden!important}' });
    await p.waitForFunction(() => document.getElementById('r4').classList.contains('r4-3d'), null, { timeout: 60000, polling: 'raf' });
    const r = await p.evaluate(() => { const r = document.getElementById('r4-404').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const w = Math.min(r.w, r.h * 3.6 / 1.75), h = w * 1.75 / 3.6, cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const png = await p.screenshot({ clip: { x: cx - w * (0.5 + MX), y: cy - h * (0.5 + MY), width: w * (1 + 2 * MX), height: h * (1 + 2 * MY) }, omitBackground: true });
    // a WebP con transparencia, usando el propio navegador
    const webp = await p.evaluate(async (b64) => {
      const img = new Image(); img.src = `data:image/png;base64,${b64}`; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', 0.82).split(',')[1];
    }, png.toString('base64'));
    fs.writeFileSync(`static/assets/img/404-cromo-${nombre}-${VERSION}.webp`, Buffer.from(webp, 'base64'));
    console.log(`assets/img/404-cromo-${nombre}-${VERSION}.webp`);
    await ctx.close();
  }
  await b.close();
})();
