/* =========================================================
   Cambia el dominio de la web en todos los archivos (Node, sin dependencias)
   Uso:  node tools/cambiar-dominio.cjs alextoll.store   (y después npm run build)
   El dominio actual se lee de src/lib/sitio.js (SITE), así que
   puedes volver a usarlo si algún día cambias de dominio.
   ========================================================= */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const nuevo = (process.argv[2] || '').trim().toLowerCase()
  .replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(nuevo)) {
  console.error('Uso: node tools/cambiar-dominio.cjs tudominio.es');
  process.exit(1);
}

const sitio = fs.readFileSync(path.join(ROOT, 'src/lib/sitio.js'), 'utf8');
const actual = sitio.match(/const SITE = 'https?:\/\/([^/']+)\/'/)[1];

/* Dominios a sustituir: el actual y el de ejemplo de la guía de nginx */
const viejos = [...new Set([actual, 'tudominio.es'])].filter(d => d !== nuevo);
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const re = new RegExp(`(?<![a-z0-9-])(${viejos.map(escRe).join('|')})(?![a-z0-9-])`, 'g');

/* Archivos donde aparece el dominio (LEEME.md se deja: explica Netlify).
   Las páginas lo toman de src/lib/sitio.js al compilar (npm run build). */
const archivos = [
  'src/lib/sitio.js', 'src/routes/diagnostico/+page.svelte',
  'static/robots.txt', 'static/assets/alextoll.vcf', 'README.md',
  'docs/cartel.html', 'docs/tarjetas.html', 'docs/tarjeta-resena.html', 'docs/ESTADISTICAS.md',
  'deploy/nginx-alextoll.conf', 'deploy/SUBIR-A-NGINX.md',
];

let total = 0;
for (const f of archivos) {
  const ruta = path.join(ROOT, f);
  if (!fs.existsSync(ruta)) continue;
  const antes = fs.readFileSync(ruta, 'utf8');
  let n = 0;
  const despues = antes.replace(re, () => (n++, nuevo));
  if (n) {
    fs.writeFileSync(ruta, despues);
    console.log(`${String(n).padStart(3)}  ${f}`);
    total += n;
  }
}
console.log(`\n${total} cambios: ${viejos.join(', ')} → ${nuevo}`);
