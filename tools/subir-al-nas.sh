#!/usr/bin/env bash
# =========================================================
# Genera la web (SvelteKit → carpeta build/), la sube al NAS UGREEN y la pone en marcha (Docker)
# Uso (Git Bash, desde la carpeta de la web):  bash tools/subir-al-nas.sh
# Necesita el SSH del NAS activado (Panel de control → Terminal → SSH).
# No toca las claves (.env) ni los datos de visitas (datos/).
# Guía: deploy/SUBIR-AL-NAS.md
# =========================================================
set -euo pipefail

NAS="${NAS:-AlextollM@192.168.1.25}"
DEST=/volume2/docker/webs/alextoll
cd "$(dirname "$0")/.."

# Lo que se publica es la carpeta build/ entera: las páginas que genera SvelteKit
# (src/routes) más todo lo de static/ (assets, css, js...).
echo "→ Generando la web (npm run build)"
[ -d node_modules ] || npm ci
rm -rf build
npm run build --silent
[ -f build/index.html ] && [ -f build/404.html ] || { echo "✗ La web no se ha generado bien: no subo nada"; exit 1; }

echo "→ Preparando $NAS:$DEST"
ssh "$NAS" "mkdir -p $DEST/.subida/web $DEST/servidor $DEST/datos"

# Copia de lo que hay ahora en el NAS (web, nginx, compose y contador) en .anterior/,
# por si hay que volver atrás: bash tools/volver-atras.sh
echo "→ Guardando la versión actual en $DEST/.anterior"
ssh "$NAS" "cd $DEST && rm -rf .anterior && mkdir .anterior && for x in web nginx.conf docker-compose.yml servidor; do [ -e \$x ] && cp -a \$x .anterior/; done; true"

echo "→ Subiendo la web"
tar -cf - -C build . | ssh "$NAS" "rm -rf $DEST/.subida/web && mkdir -p $DEST/.subida/web && tar -xf - -C $DEST/.subida/web"

echo "→ Subiendo contador y configuración"
tar -cf - -C servidor api.mjs contador.mjs | ssh "$NAS" "tar -xf - -C $DEST/servidor"
# cat > ... conserva el archivo original: Docker lo tiene montado y no vería uno nuevo
ssh "$NAS" "cat > $DEST/docker-compose.yml" < deploy/nas/docker-compose.yml
ssh "$NAS" "cat > $DEST/nginx.conf" < deploy/nas/nginx.conf

echo "→ Arrancando en el NAS"
ssh "$NAS" 'bash -s' <<EOF
set -e
cd $DEST
# Cambia la web de golpe (rsync sobre la misma carpeta: nginx no deja de verla)
mkdir -p web
rsync -a --delete .subida/web/ web/
rm -rf .subida

# La primera vez se crea .env con una clave del panel al azar
if [ ! -f .env ]; then
  printf 'STATS_KEY=%s\nTUNNEL_TOKEN=\n' "\$(head -c 24 /dev/urandom | base64 | tr -d '/+=')" > .env
  chmod 600 .env
  echo "   Creado .env con una clave nueva para el panel de estadísticas"
fi

# El túnel solo arranca cuando .env tiene TUNNEL_TOKEN
if grep -q '^TUNNEL_TOKEN=.' .env; then
  docker compose up -d --quiet-pull --remove-orphans
else
  docker compose up -d --quiet-pull web estadisticas
  echo "   Túnel de Cloudflare sin configurar (falta TUNNEL_TOKEN en .env)"
fi
docker compose restart estadisticas >/dev/null
docker compose exec -T web sh -c 'if nginx -t -q 2>/dev/null; then nginx -s reload 2>/dev/null; else nginx -t; exit 1; fi'
docker compose ps --format '   {{.Service}}: {{.Status}}'
EOF

node tools/avisar-buscadores.js || true

echo "✓ Listo. En casa: http://192.168.1.25:8090  ·  En internet: https://alextoll.store"
