# Área de clientes (clientes.html)

Tus clientes entran con **correo y contraseña, Google, X o Facebook** y ven sus trabajos:
la etapa en la que están, el presupuesto (y lo pueden aceptar) y las novedades.
Tú entras con **alextoll2005@gmail.com** y ves el **panel**, donde creas y actualizas los trabajos.

Mientras `static/js/config.js → firebase` esté vacío, la página dice **"Muy pronto"**.

## Cómo funciona

| Pieza | Dónde |
|---|---|
| Página | `src/routes/clientes/+page.svelte` → `clientes.html` (al compilar) |
| Estilos | `static/css/clientes.css` |
| Lógica | `static/js/modules/clientes.js` y `static/js/lib/firestore.js` |
| Etapas de cada trabajo | `static/js/data/clientes.js` |
| SDK de Firebase (solo inicio de sesión, guardado en la web) | `static/js/vendor/firebase/` (versión 12.19.0) |
| Reglas de seguridad de la base de datos | `deploy/firebase/firestore.rules` |
| Permisos del servidor (CSP solo para esta página) | `deploy/nas/nginx.conf` → `location = /clientes.html` |

- Cada trabajo se guarda con el **correo del cliente**. El cliente ve los trabajos que tienen su correo, así que
  cuando crees uno pon el mismo correo con el que el cliente va a entrar.
- Lo que protege los datos son las **reglas** (`firestore.rules`), no el JavaScript: un cliente solo puede leer
  sus trabajos y lo único que puede cambiar es aceptar el presupuesto. Esto está probado con los emuladores.
- Una persona = un correo. Si alguien entró con Google y luego prueba con Facebook con el mismo correo,
  la web le dice que entre con el método que ya usó.

---

## Puesta en marcha (una sola vez, unos 30 minutos)

### 1. Crear el proyecto de Firebase
1. Entra en <https://console.firebase.google.com> con tu cuenta de Google → **Crear un proyecto** → nombre `alextoll`.
   Google Analytics: **no** hace falta.
2. En la portada del proyecto pulsa el icono **`</>`** (app web) → apodo `alextoll-web` → **Registrar app**
   (sin Firebase Hosting).
3. Te enseña un bloque `firebaseConfig`. **Cópialo y pásamelo**, o pega tú los cuatro valores en
   `js/config.js → firebase` (`apiKey`, `authDomain`, `projectId`, `appId`).
   Estos datos no son secretos: van en todas las webs que usan Firebase. Lo que protege son las reglas.

### 2. Activar el inicio de sesión
1. Menú **Compilación → Authentication → Comenzar**.
2. Pestaña **Método de acceso**:
   - **Correo electrónico/contraseña** → Habilitar → Guardar (deja desactivado "vínculo de correo").
   - **Google** → Habilitar → correo de asistencia: el tuyo → Guardar.
3. Pestaña **Configuración → Dominios autorizados → Agregar dominio**: `alextoll.store` y `www.alextoll.store`.
4. Pestaña **Plantillas** → icono del lápiz → **Idioma de la plantilla: español** (así los correos de
   "confirma tu correo" y "cambia tu contraseña" llegan en español).

### 3. Crear la base de datos y publicar las reglas
1. **Compilación → Firestore Database → Crear base de datos**.
2. Ubicación: **`europe-southwest1` (Madrid)** (no se puede cambiar después) → **Modo de producción**.
3. Pestaña **Reglas** → borra lo que hay → pega el contenido de `deploy/firebase/firestore.rules` → **Publicar**.

### 4. Facebook
1. Entra en <https://developers.facebook.com> → **Mis apps → Crear app**.
2. Caso de uso: **"Autenticar y solicitar datos a los usuarios con el inicio de sesión con Facebook"**.
3. En la app: **Configuración de la app → Básica**: copia el **Identificador de la app** y la **Clave secreta**.
   Rellena también: URL de la política de privacidad `https://alextoll.store/privacidad.html`,
   URL de eliminación de datos `https://alextoll.store/privacidad.html#clientes`, categoría y el icono.
4. En Firebase: **Authentication → Método de acceso → Facebook → Habilitar**, pega el ID y la clave secreta.
   Copia la **URI de redireccionamiento de OAuth** que te enseña (algo como
   `https://alextoll-xxxx.firebaseapp.com/__/auth/handler`) → Guardar.
5. En Facebook: **Inicio de sesión con Facebook → Configuración → URI de redireccionamiento de OAuth válidos**:
   pega esa URI → Guardar.
6. Pon la app en modo **Activo / Publicada** (arriba en la app). Mientras esté en "Desarrollo",
   solo podéis entrar tú y quien añadas como probador.

### 5. X (Twitter)
1. Entra en <https://developer.x.com> → **Developer Portal** → acepta el plan **Free**
   (te pide describir el uso: "Login with X for the customer area of my website alextoll.store").
2. En tu app → **User authentication settings → Set up**:
   - App permissions: **Read** y activa **Request email from users** (sin esto X no da el correo y el cliente
     no vería sus trabajos).
   - Type of App: **Web App**.
   - Callback URI: la misma URI de Firebase del paso 4 (`https://alextoll-xxxx.firebaseapp.com/__/auth/handler`).
   - Website URL `https://alextoll.store`, Terms `https://alextoll.store/aviso-legal.html`,
     Privacy `https://alextoll.store/privacidad.html` → Save.
3. Pestaña **Keys and tokens → Consumer Keys → API Key and Secret** → Regenerate → copia los dos.
4. En Firebase: **Authentication → Método de acceso → Twitter → Habilitar** → pega **API Key** y **API Secret** → Guardar.

### 6. Publicar
Cuando me pases el `firebaseConfig` (paso 1.3): lo pongo en `js/config.js`, subo la web al NAS
(`bash tools/subir-al-nas.sh`, que también actualiza el nginx con los permisos de esta página) y lo pruebo.

---

## Uso diario
1. Entra en **https://alextoll.store/clientes.html** con **Google (alextoll2005@gmail.com)** → ves el panel.
2. **Nuevo trabajo**: correo del cliente (con el que entrará), nombre, tipo (ordenador o web), título,
   qué se hace, etapa, fecha prevista y el presupuesto por líneas.
3. Cada vez que avances: abre el trabajo, cambia la **etapa** (se apunta sola en "Novedades") y, si quieres,
   escribe una novedad para el cliente.
4. Cuando el cliente acepta el presupuesto, en el panel aparece "Presupuesto aceptado".
5. Mándale al cliente el enlace `alextoll.store/clientes.html` y dile que entre con el correo que te dio.

Las etapas y sus textos se cambian en `js/data/clientes.js` (no cambies los `id`).

## Probar en tu PC sin tocar nada real (emuladores)
```bash
cd deploy/firebase
npx firebase-tools emulators:start --only auth,firestore --project demo-alextoll
```
Sirve la web en `http://127.0.0.1:PUERTO/` y abre `clientes.html?emulador`: usa cuentas y datos de mentira,
con las reglas de verdad. Necesita Java instalado.

## Si algo falla
- **"Esta web todavía no está autorizada en Firebase"**: falta el dominio en Authentication → Configuración → Dominios autorizados.
- **"Este método de acceso todavía no está activado"**: falta habilitar ese proveedor en Firebase (pasos 2, 4 o 5).
- **El panel dice "No tienes permiso"**: no se han publicado las reglas (paso 3) o has entrado con otro correo.
- **El cliente no ve su trabajo**: el correo del trabajo no es el mismo con el que ha entrado
  (en la barra de arriba sale con qué correo está dentro).
- **Si cambias tu correo de administrador**: cámbialo en `js/config.js → adminEmail` y en `firestore.rules` (y vuelve a publicarlas).
