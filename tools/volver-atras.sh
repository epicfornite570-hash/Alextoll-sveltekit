#!/usr/bin/env bash
# =========================================================
# Vuelve a poner en el NAS la versión anterior de la web (la que guardó
# tools/subir-al-nas.sh en .anterior/ justo antes de la última subida).
# Uso (Git Bash, desde la carpeta de la web):  bash tools/volver-atras.sh
# Necesita el SSH del NAS activado (Panel de control → Terminal → SSH).
# No toca las claves (.env) ni los datos de visitas (datos/).
# =========================================================
set -euo pipefail

NAS="${NAS:-AlextollM@192.168.1.25}"
DEST=/volume2/docker/webs/alextoll

echo "→ Volviendo a la versión anterior en $NAS:$DEST"
ssh "$NAS" 'bash -s' <<EOF2
set -e
cd $DEST
[ -d .anterior/web ] || { echo "✗ No hay copia en .anterior/: no cambio nada"; exit 1; }
rsync -a --delete .anterior/web/ web/
# cat > ... conserva el archivo original: Docker lo tiene montado y no vería uno nuevo
[ -f .anterior/nginx.conf ] && cat .anterior/nginx.conf > nginx.conf
[ -f .anterior/docker-compose.yml ] && cat .anterior/docker-compose.yml > docker-compose.yml
[ -d .anterior/servidor ] && rsync -a --delete .anterior/servidor/ servidor/
docker compose up -d --quiet-pull web estadisticas
docker compose restart estadisticas >/dev/null
docker compose exec -T web sh -c 'if nginx -t -q 2>/dev/null; then nginx -s reload 2>/dev/null; else nginx -t; exit 1; fi'
docker compose ps --format '   {{.Service}}: {{.Status}}'
EOF2

echo "✓ Listo: la web vuelve a ser la de antes de la última subida. https://alextoll.store"
