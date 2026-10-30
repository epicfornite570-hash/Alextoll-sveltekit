/* =========================================================
   ALEXTOLL · Configuración general
   ---------------------------------------------------------
   Tus datos en un solo sitio. Lo que cambies aquí se usa en
   los botones de email, el formulario, las preguntas, etc.

   OJO: el email también está escrito en el HTML (para Google
   y por si el navegador no carga JavaScript). Si lo cambias,
   búscalo también en src/ (páginas de Svelte) y vuelve a compilar.

   El teléfono y WhatsApp se quitaron de la web a propósito
   (privacidad): el contacto es por email y por el formulario.
   ========================================================= */
window.AT = window.AT || {};

AT.config = {
  marca: 'Alextoll',
  titular: 'Alejandro Martín Rodríguez',

  email: 'alextoll2005@gmail.com',

  /* Asunto que aparece escrito al abrir el email */
  asuntoEmail: 'Consulta para Alextoll',

  /* Tu zona de trabajo. Aparece en la tarjeta de contacto y en "¿Dónde trabajas?".
     Si la cambias, cámbiala también en ordenadores.html (título, descripción, texto principal,
     pregunta "¿Dónde trabajas?" y el bloque application/ld+json), que están escritos
     a mano para que Google los lea sin JavaScript. */
  zona: 'Madrid',

  /* ¿Vas a domicilio? true / false. Solo se muestra si hay zona. */
  aDomicilio: false,

  /* Formulario:
     - '/' = Netlify Forms (cada mensaje aparece en tu panel de Netlify, pestaña Forms).
     - Para Formspree: 'https://formspree.io/f/TU_ID' */
  formEndpoint: '/',

  /* Web3Forms (recomendado si la web se aloja en tu propio servidor, p. ej. nginx):
     los mensajes del formulario te llegan al correo, sin programar nada en el servidor.
     1. Entra en https://web3forms.com, escribe tu correo y pulsa "Create Access Key".
     2. Te llega un correo con la clave (algo como 'a1b2c3d4-....'). Pégala aquí.
     Con clave puesta se usa Web3Forms; vacía, se usa formEndpoint (Netlify Forms). */
  web3formsKey: '1424eb40-35d0-4819-9bf4-b7603be947af',

  /* Reseñas: enlace para escribir una reseña en tu Perfil de Empresa de Google.
     Lo sacas en business.google.com → "Pedir reseñas" (algo como https://g.page/r/XXXX/review).
     Lo usa resena.html (la página que mandas al cliente al terminar).
     Vacío = la página ofrece solo contarlo por email. */
  resenasGoogle: '',

  /* Área de clientes (clientes.html): inicio de sesión con Firebase.
     Pega aquí los datos de tu proyecto: consola de Firebase → ⚙ Configuración del proyecto
     → "Tus apps" → app web → "Configuración del SDK" (objeto firebaseConfig).
     Vacío = la página dice que el área de clientes llega pronto.
     Guía paso a paso: deploy/AREA-CLIENTES.md */
  firebase: {
    apiKey: 'AIzaSyALgWjQnLCyUeTfqlRg4Y5ZdHZ5_77Emp8',
    authDomain: 'alextoll-web-959a5.firebaseapp.com',
    projectId: 'alextoll-web-959a5',
    appId: '1:1068906081237:web:42ef27b1aac3dc6fbeab5c'
  },
  /* Quien entra con este correo ve el panel para crear y actualizar trabajos.
     Si lo cambias, cámbialo también en deploy/firebase/firestore.rules */
  adminEmail: 'alextoll2005@gmail.com',

  /* Estadísticas (opcional). Se cargan SOLO si el visitante acepta las cookies de estadísticas.
     Pega aquí la URL del script de tu herramienta (p. ej. GoatCounter, Plausible...).
     Recuerda añadir su dominio a la Content-Security-Policy de netlify.toml
     y a la tabla de cookies.html. */
  statsScript: '',

  /* Indicadores de confianza de la portada ("Un servicio claro y sin sorpresas").
     Se muestran los que tienen "valor", como mucho cuatro y en este orden.
     Los tres primeros están vacíos a propósito: rellénalos SOLO con datos reales, p. ej.
       { icono:'lLaptop', valor:'+150',    texto:'Equipos reparados' }
       { icono:'lClock',  valor:'+5 años', texto:'De experiencia' }
       { icono:'lShield', valor:'Garantía', texto:'3 meses en reparaciones' }
     Iconos disponibles: AT.LINEA en js/lib/icons.js
     en: [valor, texto] en inglés, para las páginas de en/ */
  confianza: [
    { icono:'lLaptop', valor:'', texto:'Equipos reparados', en:['', 'Computers repaired'] },
    { icono:'lClock',  valor:'', texto:'De experiencia', en:['', 'Of experience'] },
    { icono:'lShield', valor:'', texto:'En todas las reparaciones', en:['', 'On every repair'] },
    { icono:'lUsers',  valor:'Trato personal',       texto:'Hablas siempre conmigo', en:['Personal service', 'You always deal with me'] },
    { icono:'lFile',   valor:'Presupuesto gratis',   texto:'Antes de tocar nada', en:['Free quote', 'Before I touch anything'] },
    { icono:'lShield', valor:'Tus datos, a salvo',   texto:'Copia antes de formatear', en:['Your data, safe', 'Backup before any wipe'] },
    { icono:'lLaptop', valor:'Portátil y sobremesa', texto:'Con Windows o Linux', en:['Laptops and desktops', 'Windows or Linux'] }
  ]
};

/* Enlace de email con asunto y texto opcionales */
AT.mailLink = (asunto, texto) =>
  `mailto:${AT.config.email}?subject=${encodeURIComponent(asunto || (AT.t ? AT.t(AT.config.asuntoEmail, 'Enquiry for Alextoll') : AT.config.asuntoEmail))}` +
  (texto ? `&body=${encodeURIComponent(texto)}` : '');
