/* =========================================================
   Avisa a Bing, Yandex y otros buscadores (IndexNow) de que la web ha cambiado
   Uso (desde la carpeta de la web, después de npm run build):   node tools/avisar-buscadores.js
   Lo lanza solo tools/subir-al-nas.sh después de publicar.

   Manda todas las direcciones de build/sitemap.xml. La clave es el archivo
   <clave>.txt de static/ (tiene que estar publicado en la web).
   Google no usa IndexNow: para Google está Search Console.
   ========================================================= */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://' + fs.readFileSync(path.join(ROOT, 'src/lib/sitio.js'), 'utf8').match(/const SITE = 'https?:\/\/([^/']+)\/'/)[1] + '/';

const clave = fs.readdirSync(path.join(ROOT, 'static')).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!clave) { console.log('   IndexNow: no hay archivo de clave, no se avisa'); process.exit(0); }

const host = new URL(SITE).host;
const sitemap = fs.readFileSync(path.join(ROOT, 'build/sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: clave.slice(0, -4), keyLocation: `${SITE}${clave}`, urlList })
})
  .then(r => console.log(r.ok ? `   IndexNow: avisados los buscadores de ${urlList.length} páginas` : `   IndexNow: respuesta ${r.status}`))
  .catch(e => console.log(`   IndexNow: no se pudo avisar (${e.message})`));
