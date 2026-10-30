/* =========================================================
   Página de diseño web (webs.html)
   - "Ver ejemplo": abre la web de ejemplo completa en una ventana
     (también con un enlace directo: webs.html#ej-brasa, #ej-nativa, #ej-nord)
   - Botones de los planes: eligen el plan en el formulario
   - Enlaces a #idea: llevan al formulario y ponen el cursor en "Nombre"
   - Cabecera: los dispositivos siguen un poco al ratón
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.webs = {
  init() {
    if (!AT.$('#wb-devices')) return;
    this.ejemplos();
    this.formulario();
    this.inclinar();
  },

  /* ---------- Ventanas de ejemplo ---------- */
  ejemplos() {
    const html = document.documentElement;
    const cerrar = (dlg) => { if (dlg.open) dlg.close(); html.classList.remove('wb-lock'); };

    AT.$$('.wb-dlg').forEach(dlg => {
      const cuerpo = AT.$('.wb-dlg-body', dlg), web = AT.$('.ms', dlg);
      /* Versión vertical de la web de ejemplo cuando la ventana es estrecha (móvil) */
      if (web && 'ResizeObserver' in window) {
        const ro = new ResizeObserver(([en]) => web.classList.toggle('ms--p', en.contentRect.width < 760));
        ro.observe(cuerpo);
        AT.alSalir(() => ro.disconnect());
      }
      dlg.addEventListener('close', () => html.classList.remove('wb-lock'));
      /* Clic fuera de la ventana (en el fondo oscuro) */
      dlg.addEventListener('click', e => { if (e.target === dlg) cerrar(dlg); });
      AT.$$('[data-cerrar]', dlg).forEach(b => b.addEventListener('click', () => cerrar(dlg)));
    });

    const abrir = (id) => {
      const dlg = AT.$('#' + id);
      if (!dlg || !dlg.classList.contains('wb-dlg') || typeof dlg.showModal !== 'function') return;
      AT.$('.wb-dlg-body', dlg).scrollTop = 0;
      dlg.showModal();
      html.classList.add('wb-lock');
    };
    AT.$$('[data-ejemplo]').forEach(btn => btn.addEventListener('click', () => abrir(btn.dataset.ejemplo)));
    /* Enlace directo a un ejemplo: webs.html#ej-brasa (para mandarlo por WhatsApp) */
    if (/^#ej-[\w-]+$/.test(location.hash)) abrir(location.hash.slice(1));
  },

  /* ---------- Formulario ---------- */
  formulario() {
    const sel = AT.$('#f-servicio'), msg = AT.$('#f-mensaje'), nombre = AT.$('#f-nombre');

    document.addEventListener('click', e => {
      const a = e.target.closest('a[href="#idea"]'); if (!a) return;
      const plan = a.dataset.plan;
      if (plan && sel && [...sel.options].some(o => o.value === plan)) {
        sel.value = plan;
        if (msg && !msg.value.trim()) {
          const cambios = /^(Cambios|Changes)/.test(plan), nombre = plan.replace(/ \(.*\)/, '');
          msg.value = AT.t(cambios ? 'Hola, ya tengo una web y necesito ' : `Hola, me interesa la ${nombre}. Mi negocio es `,
                           cambios ? 'Hi, I already have a website and I need ' : `Hi, I'm interested in the ${nombre}. My business is `);
          msg.dispatchEvent(new Event('input'));
        }
      }
      /* El navegador hace el desplazamiento; después, el cursor al primer campo */
      setTimeout(() => nombre?.focus({ preventScroll: true }), AT.reduceMotion ? 0 : 700);
    }, { signal: AT.pagina.signal });
  },

  /* ---------- Cabecera: inclinación suave con el ratón ---------- */
  inclinar() {
    const hero = AT.$('.wb-hero'), tilt = AT.$('.wb-tilt');
    if (!hero || !tilt || AT.reduceMotion || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let raf = 0, x = 0, y = 0;
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width - .5;
      y = (e.clientY - r.top) / r.height - .5;
      if (!raf) raf = requestAnimationFrame(() => {
        tilt.style.setProperty('--ry', (x * 6).toFixed(2) + 'deg');
        tilt.style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg');
        raf = 0;
      });
    });
    hero.addEventListener('pointerleave', () => { tilt.style.removeProperty('--ry'); tilt.style.removeProperty('--rx'); });
  }
};
