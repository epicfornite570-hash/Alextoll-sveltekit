/* =========================================================
   Datos comunes de la web: dirección, ficha del negocio para Google,
   textos de la cabecera/menú/pie por idioma y los menús.
   Los usan los componentes de src/lib/componentes.

   Idiomas: la web está en español (raíz) y en inglés (carpeta en/).
   Las páginas en inglés están un nivel más abajo, así que sus rutas a
   assets/, css/ y js/ llevan delante '../' (UI.en.raiz). El botón ES/EN
   del menú lleva a la otra versión de la misma página (alt). Nunca se
   cambia de idioma sin que el visitante lo pida.
   ========================================================= */

export const SITE = 'https://alextoll.store/';

/* Ficha del negocio para Google (datos estructurados). Google no junta datos
   entre páginas, así que cada página que nombra al negocio lleva la ficha entera. */
export const NEGOCIO = {
  '@type': 'LocalBusiness',
  '@id': `${SITE}#negocio`,
  name: 'Alextoll',
  description: 'Reparación, limpieza y mejora de ordenadores en Madrid (RAM, SSD, Windows y Linux) y diseño de páginas web para pequeños negocios.',
  url: SITE,
  image: `${SITE}assets/img/og-ordenadores.png`,
  logo: `${SITE}assets/img/icono-gris-512.png`,
  email: 'alextoll2005@gmail.com',
  founder: { '@type': 'Person', name: 'Alejandro Martín Rodríguez', alternateName: 'Alextoll', url: 'https://alextoll.xyz/', sameAs: ['https://alextoll.xyz/'] },
  priceRange: '€',
  address: { '@type': 'PostalAddress', postalCode: '28017', addressLocality: 'Madrid', addressRegion: 'Madrid', addressCountry: 'ES' },
  areaServed: { '@type': 'City', name: 'Madrid' },
  knowsAbout: ['Reparación de ordenadores', 'Limpieza de PC', 'Ampliación de RAM', 'Instalación de SSD', 'Instalación de Windows', 'Linux', 'Diseño web']
};
/* La misma ficha para las páginas en inglés */
export const NEGOCIO_EN = {
  ...NEGOCIO,
  description: 'Computer repair, cleaning and upgrades in Madrid (RAM, SSD, Windows and Linux) and website design for small businesses. Service in English and Spanish.',
  knowsAbout: ['Computer repair', 'PC cleaning', 'RAM upgrades', 'SSD installation', 'Windows installation', 'Linux', 'Web design'],
  availableLanguage: ['Spanish', 'English']
};
export const negocio = (lang = 'es') => lang === 'en' ? NEGOCIO_EN : NEGOCIO;

/* ---------- Textos comunes por idioma ----------
   raiz: lo que va delante de assets/, css/ y js/ (las páginas en inglés están en en/)
   otro: el botón para cambiar a la otra versión */
export const UI = {
  es: {
    raiz: '', html: 'es', og: 'es_ES',
    saltar: 'Saltar al contenido', irInicio: 'Alextoll, ir al inicio', principal: 'Principal',
    clientes: 'Clientes', areaClientes: 'Área de clientes', abrirMenu: 'Abrir menú',
    otro: { lang: 'en', corto: 'EN', aria: 'Read this page in English', pie: 'English version' },
    inicio: 'Inicio', ordenadores: 'Ordenadores', webs: 'Webs', sobreMi: 'Sobre mí', contacto: 'Contacto',
    moviles: 'Móviles', reparaMoviles: 'Reparación de móviles',
    pieNav: 'Pie de página', pieTag: 'Tecnología, diseño y personas.', queNecesitas: '¿Qué necesitas?',
    dondeTrabajo: 'Dónde trabajo: Madrid',
    pieOrdenadores: 'Ordenadores en Madrid', todosServicios: 'Todos los servicios',
    conoce: 'Conoce a Alextoll', disenoWeb: 'Diseño de páginas web', diagnostico: 'Diagnóstico rápido online',
    areaCli: 'Área de clientes', resena: 'Déjame tu opinión', avisoLegal: 'Aviso legal', privacidad: 'Política de privacidad',
    cookiesPol: 'Política de cookies', configCookies: 'Configurar cookies', zona: 'Zona de trabajo: Madrid',
    enEs: '', hablarlo: '¿Prefieres hablarlo directamente?', asunto: 'Consulta%20para%20Alextoll', formulario: 'Formulario de contacto',
    diagOnline: 'Diagnóstico online', privCorta: 'Privacidad', cookiesCorta: 'Cookies',
    ckKicker: 'Privacidad', ckTitulo: 'Cookies, las justas',
    ckTexto: 'Uso lo necesario para que la web funcione y recuerde tu elección. Si aceptas, también contaré visitas de forma anónima para saber qué páginas sirven y mejorarlas. Nada de publicidad ni rastreo. Más en la <a href="cookies.html">política de cookies</a>.',
    ckNec: 'Necesarias', ckNecTxt: 'Recuerdan tu elección y lo que escribes en los formularios. Siempre activas.', ckNecAria: 'Cookies necesarias',
    ckEst: 'Estadísticas', ckEstTxt: 'Cuento qué páginas se ven y desde dónde llegas, sin identificarte.', ckEstAria: 'Cookies de estadísticas',
    ckSi: 'Aceptar', ckNo: 'Rechazar', ckConf: 'Personalizar', ckGuardar: 'Guardar elección', ckCerrar: 'Cerrar',
    ckOk: 'Preferencias guardadas', ckSoloNec: 'Solo lo necesario'
  },
  en: {
    raiz: '../', html: 'en', og: 'en_GB',
    saltar: 'Skip to content', irInicio: 'Alextoll, go to the home page', principal: 'Main',
    clientes: 'Clients', areaClientes: 'Clients: client area (in Spanish)', abrirMenu: 'Open menu',
    otro: { lang: 'es', corto: 'ES', aria: 'Ver esta página en español', pie: 'Versión en español' },
    inicio: 'Home', ordenadores: 'Computers', webs: 'Websites', sobreMi: 'About me', contacto: 'Contact',
    moviles: 'Phones', reparaMoviles: 'Phone screen repair',
    pieNav: 'Footer', pieTag: 'Technology, design and people.', queNecesitas: 'What do you need?',
    dondeTrabajo: 'Where I work: Madrid',
    pieOrdenadores: 'Computers in Madrid', todosServicios: 'All services',
    conoce: 'Meet Alextoll', disenoWeb: 'Website design', diagnostico: 'Quick online check',
    areaCli: 'Client area', resena: 'Leave a review', avisoLegal: 'Legal notice', privacidad: 'Privacy policy',
    cookiesPol: 'Cookie policy', configCookies: 'Cookie settings', zona: 'Service area: Madrid',
    /* Marca de los enlaces a páginas que solo están en español */
    enEs: ' <span class="lang-es" title="In Spanish">(ES)</span>',
    hablarlo: 'Would you rather talk it through?', asunto: 'Enquiry%20for%20Alextoll', formulario: 'Contact form',
    diagOnline: 'Online check', privCorta: 'Privacy', cookiesCorta: 'Cookies',
    ckKicker: 'Privacy', ckTitulo: 'Cookies, only the essentials',
    ckTexto: 'I use what the site needs to work and to remember your choice. If you accept, I will also count visits anonymously to see which pages help and improve them. No ads, no tracking. More in the <a href="../cookies.html" hreflang="es">cookie policy</a> (in Spanish).',
    ckNec: 'Necessary', ckNecTxt: 'They remember your choice and what you type in forms. Always on.', ckNecAria: 'Necessary cookies',
    ckEst: 'Statistics', ckEstTxt: 'I count which pages are seen and where you came from, without identifying you.', ckEstAria: 'Statistics cookies',
    ckSi: 'Accept', ckNo: 'Reject', ckConf: 'Customise', ckGuardar: 'Save choice', ckCerrar: 'Close',
    ckOk: 'Preferences saved', ckSoloNec: 'Only the essentials'
  }
};
export const ui = (lang = 'es') => UI[lang] || UI.es;

/* Enlace a la otra versión de la página (relativo a la página actual).
   alt = { es: 'ordenadores.html', en: 'en/computers.html' } (rutas desde la raíz de la web).
   Sin alt (páginas que solo están en español) lleva a la portada del otro idioma. */
export const otraVersion = (lang = 'es', alt) => lang === 'en'
  ? '../' + (alt && alt.es ? alt.es : 'index.html')
  : (alt && alt.en ? alt.en : 'en/index.html');

/* Páginas principales con versión en inglés: [español, inglés] (las de servicio, en
   src/lib/datos/servicios.js). Se usan para el botón ES/EN, hreflang y el sitemap. */
export const PARES = {
  portada: { es: 'index.html', en: 'en/index.html' },
  ordenadores: { es: 'ordenadores.html', en: 'en/computers.html' },
  webs: { es: 'webs.html', en: 'en/web-design.html' },
  moviles: { es: 'reparacion-moviles.html', en: 'en/phone-screen-repair.html' }
};

/* Dirección pública de una página: index.html → carpeta */
export const publica = (p) => SITE + p.replace(/(^|\/)index\.html$/, '$1');

/* ---------- Menús ----------
   La web tiene tres partes: Ordenadores, Webs y Móviles, con la portada (index.html) como entrada.
   "Sobre mí" lleva a la sección #conoce (la puerta al portfolio, componentes/Conoce.svelte) de la portada o de ordenadores.
   MENU_MARCA:       portada, páginas legales, gracias, 404, reseñas
   MENU_ORDENADORES: la parte de ordenadores (ordenadores.html, páginas de servicio, diagnóstico)
   Cada enlace es [href, texto]. menuLocal() convierte "pagina.html#x" en "#x" para usarlo
   dentro de esa misma página. Los _EN son los mismos menús de las páginas en inglés (carpeta en/). */
export const MENU_MARCA = {
  enlaces: [['ordenadores.html', 'Ordenadores'], ['webs.html', 'Webs'], ['reparacion-moviles.html', 'Reparación de móviles'], ['index.html#conoce', 'Sobre mí'], ['index.html#contacto', 'Contacto']],
  cta: ['index.html#caminos', '¿Qué necesitas?'], logo: 'index.html'
};
export const MENU_ORDENADORES = {
  enlaces: [['index.html', 'Inicio'], ['ordenadores.html#servicios', 'Servicios'], ['webs.html', 'Webs'], ['ordenadores.html#trabajos', 'Trabajos'], ['ordenadores.html#conoce', 'Sobre mí'], ['ordenadores.html#preguntas', 'FAQ'], ['ordenadores.html#contacto', 'Contacto']],
  cta: ['ordenadores.html#contacto', 'Pedir diagnóstico'], logo: 'index.html'
};
export const MENU_MARCA_EN = {
  enlaces: [['computers.html', 'Computers'], ['web-design.html', 'Websites'], ['phone-screen-repair.html', 'Phone repair'], ['index.html#conoce', 'About me'], ['index.html#contacto', 'Contact']],
  cta: ['index.html#caminos', 'What do you need?'], logo: 'index.html', lang: 'en'
};
export const MENU_ORDENADORES_EN = {
  enlaces: [['index.html', 'Home'], ['computers.html#servicios', 'Services'], ['web-design.html', 'Websites'], ['computers.html#trabajos', 'Work'], ['computers.html#conoce', 'About me'], ['computers.html#preguntas', 'FAQ'], ['computers.html#contacto', 'Contact']],
  cta: ['computers.html#contacto', 'Get a quote'], logo: 'index.html', lang: 'en'
};
export const menuLocal = (menu, archivo) => {
  const loc = (h) => h.startsWith(archivo + '#') ? h.slice(archivo.length) : h;
  return { ...menu, enlaces: menu.enlaces.map(([h, t]) => [loc(h), t]), cta: [loc(menu.cta[0]), menu.cta[1]], logo: menu.logo === archivo ? '#inicio' : menu.logo };
};

/* Enlaces del pie según el idioma. Las páginas que solo existen en español
   se enlazan desde las páginas en inglés con ../ y la marca (ES). */
export const PIE = {
  es: { inicio: 'index.html', ordenadores: 'ordenadores.html', webs: 'webs.html', moviles: 'reparacion-moviles.html', sobreMi: 'index.html#conoce', es: '' },
  en: { inicio: 'index.html', ordenadores: 'computers.html', webs: 'web-design.html', moviles: 'phone-screen-repair.html', sobreMi: 'index.html#conoce', es: '../' }
};

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* Bloque <script type="application/ld+json"> (datos estructurados para Google).
   Se escapa "<" para que ningún texto pueda cerrar la etiqueta antes de tiempo. */
export const jsonld = (j) => `<script type="application/ld+json">\n${JSON.stringify(j, null, 2).replace(/</g, '\\u003c')}\n</script>`;
