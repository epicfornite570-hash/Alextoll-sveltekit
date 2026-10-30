# La web en el NAS UGREEN (Docker + Cloudflare Tunnel)

La web está en el NAS (`192.168.1.25`), en `/volume2/docker/webs/alextoll`, dentro de Docker:

| Contenedor     | Qué hace                                                         |
|----------------|------------------------------------------------------------------|
| `web`          | nginx con la web (`deploy/nas/nginx.conf`)                        |
| `estadisticas` | contador de visitas y panel (`servidor/api.mjs`, datos en `datos/`) |
| `tunel`        | Cloudflare Tunnel: publica la web en `https://alextoll.store`     |

Con el túnel **no se abre ningún puerto en el router**, el HTTPS lo pone Cloudflare y nadie ve la IP
de casa. En casa también se puede ver en `http://192.168.1.25:8090`.

Las claves están en el NAS, en `/volume2/docker/webs/alextoll/.env` (no se suben a git):
- `STATS_KEY`: la clave del panel `https://alextoll.store/estadisticas.html`
- `TUNNEL_TOKEN`: el código del túnel de Cloudflare

---

## Subir cambios de la web
1. Activa el SSH del NAS (UGOS → Panel de control → Terminal → SSH).
2. En Git Bash, dentro de la carpeta de la web:
   ```bash
   bash tools/subir-al-nas.sh
   ```
   El script primero genera la web con SvelteKit (`npm run build`, carpeta `build/`; la primera vez
   instala las dependencias con `npm ci`, hace falta Node.js 20 o más) y luego sube esa carpeta.
   Si el build falla, no sube nada y la web que hay en el NAS sigue igual.
   Fuera de casa (por Tailscale): `NAS=usuario@IP-de-Tailscale bash tools/subir-al-nas.sh`
3. Recarga la web: los cambios en páginas, CSS y JS se ven al momento (nginx manda `no-cache`
   y Cloudflare tiene **Browser Cache TTL = Respect Existing Headers**).
   Si cambias una **imagen o vídeo con el mismo nombre**, se guardan una semana en caché: ponle otro
   nombre o vacía la caché en Cloudflare → **Caching → Configuration → Purge Everything**.

El script no toca `.env` ni `datos/`. Lo que se publica es siempre la carpeta `build/` entera
(las páginas de `src/` más todo lo de `static/`), así que una carpeta nueva dentro de `static/` se sube sola.

## Volver atrás
Antes de subir nada, `subir-al-nas.sh` guarda lo que hay en el NAS (la web, `nginx.conf`,
`docker-compose.yml` y el contador) en `/volume2/docker/webs/alextoll/.anterior/`.
Si después de una subida algo va mal, con el SSH del NAS activado:
```bash
bash tools/volver-atras.sh
```
Pone otra vez la versión anterior en un momento. Solo guarda una: la de antes de la última subida.

## Poner en marcha Cloudflare (solo una vez)
1. Crea una cuenta gratis en **cloudflare.com** → **Add a domain** → `alextoll.store` → plan **Free**.
2. Cloudflare te da **dos nameservers**. En la web donde compraste el dominio, cambia los nameservers
   por esos dos. Cuando Cloudflare lo detecte (de minutos a unas horas) te llega un correo.
3. En Cloudflare → **Zero Trust** → **Networks → Tunnels** → **Create a tunnel** → **Cloudflared** →
   nombre `alextoll` → entorno **Docker**. Copia el código largo que va después de `--token`.
4. En ese túnel añade dos rutas públicas (**Public hostname** / **Published application routes**):
   - dominio `alextoll.store`, servicio **HTTP**, URL `web:80`
   - subdominio `www`, dominio `alextoll.store`, servicio **HTTP**, URL `web:80`
5. Pon el código en el NAS, en `.env`, en la línea `TUNNEL_TOKEN=`, y vuelve a ejecutar
   `bash tools/subir-al-nas.sh` (ahora arranca también el túnel).

## Ajustes de Cloudflare
- **SSL/TLS → Edge Certificates → Always Use HTTPS**: activado.
- **Caching → Configuration → Browser Cache TTL**: **Respect Existing Headers** (si no, Cloudflare
  guarda el CSS y el JS 4 horas y los cambios tardan en verse).
- **Speed → Rocket Loader**: desactivado (cambia el orden de los scripts y rompe la web).
- **Scrape Shield → Email Address Obfuscation**: desactivado (no hace falta y modifica el HTML).
- No actives **Web Analytics** de Cloudflare: la web ya tiene su contador y la seguridad (CSP) lo bloquearía.

## Comprobar que todo va
- `https://alextoll.store` carga con el vídeo; `https://www.alextoll.store` lleva a `alextoll.store`.
- `https://alextoll.store/docs/` da **404**.
- `https://alextoll.store/estadisticas.html` → escribe tu clave (`STATS_KEY`) → ves el panel. Marca
  **"No contar mis visitas desde este navegador"** (también en el móvil).

## Si algo falla (por SSH en el NAS)
```bash
cd /volume2/docker/webs/alextoll
docker compose ps                    # los tres deben estar "Up"
docker compose logs --tail 50 web
docker compose logs --tail 50 tunel  # "Registered tunnel connection" = el túnel va bien
docker compose restart
```
- Las páginas dan 403: los permisos de UGOS (`ugacl`) solo dejan leer al usuario del NAS; por eso
  `web` y `estadisticas` funcionan con `user: "1000:10"` en `docker-compose.yml`.
