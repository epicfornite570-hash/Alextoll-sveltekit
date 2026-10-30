/* =========================================================
   Graba un vídeo de prueba de la cabecera de Halloween (portada)
   fotograma a fotograma con un reloj virtual: cada captura avanza
   exactamente 32 ms (31,25 fotogramas/s) aunque el equipo tarde
   segundos en dibujar (p. ej. sin tarjeta gráfica). requestAnimationFrame
   y performance.now van con ese reloj; las animaciones CSS se mueven a mano.
   (El reloj de Playwright, page.clock, hace que la animación corra de más.)

   Uso (con la web servida, p. ej. python3 -m http.server 8777):
     node tools/halloween/grabar-video.cjs NOMBRE "http://localhost:8777/#hw-calidad=1" 1920 1080 1 24
     ffmpeg -framerate 31.25 -i fr-NOMBRE/%04d.jpg -c:v libx264 -crf 17 -pix_fmt yuv420p NOMBRE.mp4
   Los fotogramas quedan en fr-NOMBRE, en la carpeta desde la que se ejecuta (no los subas
   a la web). Necesita Playwright con Chromium.
   ========================================================= */
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const [name, url, w, h, dpr, secs] = process.argv.slice(2);
  const dir = 'fr-' + name; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: +dpr });
  const p = await c.newPage();
  p.on('pageerror', e => console.log('ERROR:', e.message));
  await p.addInitScript(() => {
    let vt = 0, id = 0; const cbs = new Map();
    performance.now = () => vt;
    window.requestAnimationFrame = (cb) => { cbs.set(++id, cb); return id; };
    window.cancelAnimationFrame = (i) => { cbs.delete(i); };
    let anis = null, t0 = 0;
    window.__tick = (ms) => {
      vt += ms;
      const l = [...cbs.values()]; cbs.clear(); l.forEach(cb => { try { cb(vt); } catch (e) { console.error(e); } });
      if (anis) for (const [a, c0] of anis) a.currentTime = c0 + (vt - t0);
    };
    /* congela las animaciones CSS y desde ahora las mueve el reloj virtual */
    window.__congelarCSS = () => { t0 = vt; anis = document.getAnimations().map(a => { a.pause(); return [a, a.currentTime || 0]; }); return anis.length; };
  });
  await p.goto(url + (url.includes('#') ? '' : '#hw-software'), { waitUntil: 'load' });   // aquí no hay gráfica: sin esto el fondo empieza quieto
  await p.addStyleTag({ content: '*{-webkit-backdrop-filter:none!important;backdrop-filter:none!important}' });
  for (let i = 0; i < 400; i++) {
    await p.evaluate(() => __tick(32));
    if (await p.evaluate(() => document.getElementById('hw-calabaza').classList.contains('hw-3d-on'))) break;
    await p.waitForTimeout(50);
  }
  await p.waitForTimeout(1500);                 // el fundido de la foto al 3D (transición CSS en tiempo real)
  for (let i = 0; i < 20; i++) await p.evaluate(() => __tick(32));
  console.log(name, '3D', await p.evaluate(() => document.getElementById('hw-calabaza').classList.contains('hw-3d-on')),
    't anim', await p.evaluate(() => AT.modules.halloween.anim.t.toFixed(2)), 'animaciones CSS', await p.evaluate(() => __congelarCSS()));
  const N = Math.round(+secs * 31.25); let tt = Date.now();
  for (let k = 0; k < N; k++) {
    await p.evaluate(() => __tick(32));
    if (k % 25 == 0) { console.log('fot', k, 't', await p.evaluate(() => AT.modules.halloween.anim.t.toFixed(2)), ((Date.now() - tt) / 25 | 0) + 'ms/fot'); tt = Date.now(); }
    await p.screenshot({ path: `${dir}/${String(k).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 94 });
  }
  await b.close();
})();
