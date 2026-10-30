/* =========================================================
   Saca la foto fija de la calabaza 3D de la portada (Halloween)
   static/assets/img/halloween/calabaza-2-{600,1000}.webp
   Es el primer fotograma de la escena (postura de reposo, instante 0),
   con el mismo encuadre: se ve mientras carga, sin WebGL o con
   "reducir movimiento", y el 3D la sustituye sin que se note.
   Vuelve a ejecutarlo si cambias static/js/modules/calabaza-gl.js o calabaza-anim.js
   (y si cambia el aspecto, sube el número del nombre: la caché de imágenes dura una semana).

   Uso (desde la carpeta de la web):   node tools/halloween/foto-calabaza.cjs
   Necesita Playwright con Chromium (npm i -g playwright && npx playwright install chromium).
   ========================================================= */
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const RAIZ = path.join(__dirname, '..', '..'), SALIDA = path.join(RAIZ, 'static/assets/img/halloween');
const NOMBRE = 'calabaza-2';

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });
  const b = await chromium.launch();
  for (const lado of [600, 1000]) {
    const p = await b.newPage({ viewport: { width: lado, height: lado } });
    await p.goto('file://' + path.join(__dirname, 'calabaza.html') + '?s=' + lado);
    await p.waitForFunction(() => document.documentElement.dataset.listo, null, { timeout: 180000 });
    if (await p.evaluate(() => document.documentElement.dataset.listo) !== 'si') throw new Error('Sin WebGL en este Chromium');
    const url = await p.evaluate(() => window.foto(.9));
    const f = path.join(SALIDA, `${NOMBRE}-${lado}.webp`);
    fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
    console.log('Foto:', path.relative(RAIZ, f), Math.round(fs.statSync(f).size / 1024) + ' KB');
    await p.close();
  }
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
