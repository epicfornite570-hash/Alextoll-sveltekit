/* =========================================================
   UTILIDADES compartidas por todos los módulos
   ========================================================= */
window.AT = window.AT || {};

AT.$ = (s, el = document) => el.querySelector(s);
AT.$$ = (s, el = document) => [...el.querySelectorAll(s)];

AT.reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Idioma de la página (<html lang>): las páginas en inglés están en en/.
   AT.t('texto en español', 'text in English') devuelve el que toca.
   Rutas a assets/ desde las páginas de en/ (<html data-raiz="../">):
   AT.ruta('assets/img/x.webp') → '../assets/img/x.webp' en inglés; las absolutas no se tocan.
   AT.leerIdioma() los vuelve a leer cuando el botón ES/EN cambia la página sin recargar. */
AT.leerIdioma = () => {
  AT.lang = (document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
  AT.raiz = document.documentElement.dataset.raiz || '';
};
AT.leerIdioma();
AT.t = (es, en) => AT.lang === 'en' ? en : es;

/* Página actual. El botón ES/EN (js/modules/idioma.js) cambia el contenido sin
   recargar y vuelve a arrancar los módulos, así que lo que un módulo engancha a
   window o document tiene que poder quitarse:
     addEventListener('resize', fn, { signal: AT.pagina.signal })
     AT.alSalir(() => observador.disconnect())                                  */
AT.pagina = new AbortController();
AT.alSalir = (fn) => AT.pagina.signal.addEventListener('abort', fn, { once: true });

AT.ruta = (p) => p && AT.raiz && !/^([a-z]+:|\/|#|\.\.\/)/i.test(p) ? AT.raiz + p : p;

/* Escapa texto antes de meterlo en innerHTML (evita inyectar HTML) */
AT.esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

/* localStorage que nunca rompe la web (modo privado, cookies bloqueadas...) */
AT.store = {
  get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k){ try { localStorage.removeItem(k); } catch (e) {} }
};

/* Aviso flotante breve */
AT.toast = (msg) => {
  const t = AT.$('#toast'); if (!t) return;
  t.textContent = msg; t.hidden = false;
  clearTimeout(AT.toast.t); AT.toast.t = setTimeout(() => { t.hidden = true; }, 2400);
};

/* Desplaza hasta un elemento respetando "movimiento reducido" */
AT.scrollTo = (el) => el && el.scrollIntoView({ behavior: AT.reduceMotion ? 'auto' : 'smooth', block: 'start' });

/* Si un elemento no se ve entero (típico en móvil, cuando el resultado queda
   debajo de los botones), desplaza lo justo para enseñarlo */
AT.reveal = (el) => {
  if (!el) return;
  const r = el.getBoundingClientRect(), navH = 80;
  let dy = 0;
  if (r.top < navH) dy = r.top - navH - 12;                                        // tapado por arriba
  else if (r.bottom > innerHeight) dy = Math.min(r.bottom - innerHeight + 16, r.top - navH - 12); // cortado por abajo
  if (dy) scrollBy({ top: dy, behavior: AT.reduceMotion ? 'auto' : 'smooth' });
};

/* Servicio por id */
AT.servicio = (id) => (AT.SERVICIOS || []).find(s => s.id === id);

/* Rellena el formulario de contacto y lleva al visitante hasta él.
   Lo usan la placa, el diagnóstico y el asesor. */
AT.prefillContact = ({ servicio, mensaje } = {}) => {
  const sel = AT.$('#f-servicio'), msg = AT.$('#f-mensaje');
  /* En páginas sin formulario (diagnostico.html) se lleva al de ordenadores.html con los datos */
  if (!msg) {
    const q = new URLSearchParams();
    if (servicio) q.set('servicio', servicio);
    if (mensaje) q.set('mensaje', mensaje);
    location.href = `ordenadores.html?${q}#contacto`;
    return;
  }
  if (sel && servicio) sel.value = servicio;
  if (msg && mensaje && !msg.value.trim()) { msg.value = mensaje; msg.dispatchEvent(new Event('input')); }
  AT.scrollTo(AT.$('#contacto'));
  setTimeout(() => AT.$('#f-nombre')?.focus({ preventScroll: true }), AT.reduceMotion ? 0 : 650);
};
