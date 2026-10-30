// Prueba del parpadeo de la calabaza 3D (portada de Halloween): fuerza bajadas de calidad (fotogramas
// lentos) y cambios de tamaño, y hace una captura justo después de cada uno sin dar tiempo a otro dibujo.
// Si alguna sale sin calabaza, el lienzo se ha borrado sin volver a pintarse. Comprueba también que, tras
// muchas rachas lentas, sigue en 3D (no se queda la foto quieta) y que recupera la calidad al ir bien.
// Uso (con la web servida en local): NODE_PATH=$(npm root -g) node tools/halloween/prueba-parpadeo.cjs http://localhost:8777/
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }), p2 = await b.newPage();
  p.on('pageerror', e => console.log('ERROR:', e.message));
  await p.addInitScript(() => {
    let vt = 0, id = 0; const cbs = new Map();
    performance.now = () => vt;
    window.requestAnimationFrame = (cb) => { cbs.set(++id, cb); return id; };
    window.cancelAnimationFrame = (i) => { cbs.delete(i); };
    window.__tick = (ms) => { vt += ms; const l = [...cbs.values()]; cbs.clear(); l.forEach(cb => cb(vt)); };
  });
  await p.goto(url + (url.includes('#') ? '' : '#hw-software'), { waitUntil: 'load' });   // aquí no hay gráfica: sin esto el fondo empieza quieto
  for (let i = 0; i < 400; i++) {
    await p.evaluate(() => __tick(16));
    if (await p.evaluate(() => document.getElementById('hw-calabaza').classList.contains('hw-3d-on'))) break;
    await p.waitForTimeout(50);
  }
  await p.waitForTimeout(1500);
  const naranja = async () => {
    const r = await p.evaluate(() => { const c = document.querySelector('.hw-3d'), r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, lw: c.width }; });
    const buf = await p.screenshot({ clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
    const n = await p2.evaluate(async (b64) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data; let n = 0;
      for (let i = 0; i < d.length; i += 16) { const R = d[i], G = d[i + 1], B = d[i + 2]; if (R > 110 && R > G * 1.3 && G > B) n++; }
      return n;
    }, buf.toString('base64'));
    return { n, lado: r.lw };
  };
  let minimo = Infinity, malos = 0;
  const mira = async (que) => { const { n, lado } = await naranja(); minimo = Math.min(minimo, n); if (n < 500) malos++; console.log(que.padEnd(28), 'lienzo', lado, 'naranja', n, n < 500 ? '<-- SIN CALABAZA' : ''); };
  await mira('inicio');
  const lado0 = (await naranja()).lado;
  for (let k = 0; k < 6; k++) {                       // 6 rachas lentas (fotogramas de 70 ms): baja la calidad hasta el tope
    for (let i = 0; i < 16; i++) { await p.evaluate(() => __tick(70)); await mira(`lento ${k}.${i}`); }
  }
  const sigue3d = await p.evaluate(() => document.getElementById('hw-calabaza').classList.contains('hw-3d-on'));
  console.log('tras las rachas lentas: 3D', sigue3d ? 'sigue' : 'APAGADO (foto quieta)');
  if (!sigue3d) malos++;
  for (let k = 0; k < 8; k++) {                       // luego va bien (60 fps): tiene que recuperar la calidad
    await p.evaluate(() => { for (let i = 0; i < 560; i++) __tick(16.7); });
    await mira(`va bien ${(k + 1) * 9} s`);
  }
  const lado1 = (await naranja()).lado;
  console.log('calidad: al empezar', lado0, 'px; tras ir bien', lado1, 'px', lado1 >= lado0 ? '(recuperada)' : '(NO SE RECUPERA)');
  if (lado1 < lado0) malos++;
  for (const w of [1700, 1500, 1920]) { await p.setViewportSize({ width: w, height: 1080 }); await p.waitForTimeout(300); await mira('tamaño ' + w); }
  console.log(malos ? `FALLO: ${malos} capturas sin calabaza` : 'OK: la calabaza no desaparece nunca', 'minimo', minimo);
  await b.close();
})();
