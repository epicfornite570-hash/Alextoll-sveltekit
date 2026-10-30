/* =========================================================
   ALEXTOLL · Arranque
   ---------------------------------------------------------
   Cada módulo de js/modules/ se encarga de una parte de la web
   y solo actúa si su sección existe en la página. Así el mismo
   main.js sirve para todas las páginas.

   Para añadir una funcionalidad nueva:
   1. Crea js/modules/lo-que-sea.js con AT.modules.loQueSea = { init(){...} }
   2. Añade su <script defer> en el HTML, antes de main.js
   3. Añade 'loQueSea' a la lista ORDEN de abajo
   ========================================================= */
AT.arrancar = function () {
  const ORDEN = [
    'visitas',     // contador propio, sin cookies (js/modules/visitas.js)
    'nav',
    'video',       // vídeo de la cabecera (portada)
    'halloween',   // fondo de Halloween de la cabecera (portada, edición temporal)
    'reveal',      // entrada suave de los bloques al hacer scroll
    'contacto',
    'servicios',   // antes que diagnóstico, placa y formulario (rellena el desplegable)
    'board',
    'diagnostico',
    'asesor',
    'social',
    'portada',     // indicadores, precios y carrusel (portada)
    'form',
    'resena',      // resena.html: botón de Google (enlace en config.js)
    'ondas',       // webs.html: ondas plateadas de la cabecera
    'webs',        // webs.html: ejemplos, planes y formulario
    'moviles',     // reparacion-moviles.html: presupuesto de cambio de pantalla (con fotos)
    'clientes',    // clientes.html: inicio de sesión, mis trabajos y panel
    'marca',       // index.html (portada): brillo de las tarjetas
    'conoce',      // portada y ordenadores: "Conoce a Alextoll", la puerta al portfolio
    'cookies'
  ];
  ORDEN.forEach(name => {
    const m = AT.modules && AT.modules[name];
    if (!m) return; // módulo no cargado en esta página
    try { m.init(); } catch (err) { console.error('[Alextoll] Error en el módulo', name, err); }
  });
};
/* El botón ES/EN (js/modules/idioma.js) lo vuelve a llamar tras cambiar de idioma */
AT.arrancar();
