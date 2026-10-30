# Subir la web a tu servidor con nginx

> **¿La web va en el NAS UGREEN?** Usa [SUBIR-AL-NAS.md](SUBIR-AL-NAS.md) (Docker + Cloudflare Tunnel). Esta guía es para un servidor Ubuntu/Debian normal.

Guía para un servidor con **Ubuntu o Debian** (un VPS o tu propia máquina). Los comandos que empiezan
por `sudo` se escriben **en el servidor** (conectado por SSH); los demás, en tu PC.

Cambia `usuario@IP-del-servidor` por tus datos. El dominio (`alextoll.store`) ya está puesto en toda la web.

---

## 0. Antes de empezar
- En la web de tu proveedor de dominio crea un registro **A** que apunte `alextoll.store` y
  `www.alextoll.store` a la IP de tu servidor. Puede tardar un rato en funcionar.
- Conéctate al servidor: `ssh usuario@IP-del-servidor`

## 1. Instalar lo necesario (en el servidor)
```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx nodejs
node --version          # tiene que ser 18 o más. Si es menor, instala Node 20 desde nodesource.com
```

## 2. Subir los archivos de la web (en tu PC, PowerShell, dentro de la carpeta de la web)
Primero se genera la web con SvelteKit (sale en la carpeta `build/`) y se empaqueta esa carpeta:
```powershell
npm ci
npm run build
tar -czf web.tar.gz -C build .
scp web.tar.gz usuario@IP-del-servidor:/tmp/
scp -r servidor deploy usuario@IP-del-servidor:/tmp/
```
Y en el servidor:
```bash
sudo mkdir -p /var/www/alextoll
sudo tar -xzf /tmp/web.tar.gz -C /var/www/alextoll
sudo chown -R www-data:www-data /var/www/alextoll
```

## 3. Estadísticas (contador de visitas y panel privado)
El contador es un programa pequeño en Node (`servidor/api.mjs`) que guarda los datos en el propio
servidor. No usa cookies ni guarda IPs.
```bash
sudo mkdir -p /opt/alextoll /var/lib/alextoll
sudo cp -r /tmp/servidor /opt/alextoll/
sudo chown www-data:www-data /var/lib/alextoll

# La clave del panel: cambia el texto por una contraseña larga que solo sepas tú
echo 'STATS_KEY=pon-aqui-una-clave-larga' | sudo tee /etc/alextoll.env
sudo chmod 600 /etc/alextoll.env

sudo cp /tmp/deploy/alextoll-estadisticas.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now alextoll-estadisticas
sudo systemctl status alextoll-estadisticas      # tiene que decir "active (running)"
```

## 4. Configurar nginx
```bash
sudo cp /tmp/deploy/nginx-alextoll.conf /etc/nginx/sites-available/alextoll
sudo ln -s /etc/nginx/sites-available/alextoll /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t                                     # tiene que decir "syntax is ok" y "test is successful"
sudo systemctl reload nginx
```
Ya deberías ver la web en `http://alextoll.store`.

## 5. HTTPS gratis (candado)
```bash
sudo certbot --nginx -d alextoll.store -d www.alextoll.store
```
Acepta la redirección de http a https cuando te lo pregunte. El certificado se renueva solo.

## 6. Ajustes en la web
- Dominio: ya está puesto. Si algún día cambias de dominio: `node tools/cambiar-dominio.js nuevodominio.es`
  (cambia canónicas, sitemap, robots, tarjetas, nginx...).
- Formulario: pon la clave de Web3Forms en `static/js/config.js` (ver `LEEME.md`).
- Vuelve a subir los archivos (apartado 2).

## 7. Comprobar que todo va
- `https://alextoll.store` carga, con el vídeo de la portada.
- `https://alextoll.store/docs/` y `https://alextoll.store/servidor/` dan **404** (no deben verse).
- `https://alextoll.store/estadisticas.html` → escribe tu clave → ves el panel. Marca **"No contar mis
  visitas desde este navegador"** (hazlo también en tu móvil).
- Envía un mensaje de prueba desde el formulario y mira tu correo.

## Actualizar la web más adelante
Repite el apartado 2 (empaquetar, subir y descomprimir). Los datos de visitas no se tocan: están en
`/var/lib/alextoll`. Si cambias `servidor/api.mjs`, cópialo otra vez a `/opt/alextoll/servidor/` y
ejecuta `sudo systemctl restart alextoll-estadisticas`.

## Si algo falla
- Errores de nginx: `sudo tail -n 50 /var/log/nginx/error.log`
- Errores del contador: `sudo journalctl -u alextoll-estadisticas -n 50`
- El panel dice "Falta configurar la clave": revisa `/etc/alextoll.env` y reinicia el servicio.
