/* =========================================================
   Entrada suave de los bloques al hacer scroll
   - En la portada: los elementos con data-reveal.
   - En el resto de páginas: los bloques de cada sección.
   Los hermanos entran uno detrás de otro (pequeño retraso).
   Con "reducir movimiento" no hace nada (todo se ve desde el principio).
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.reveal = {
  init() {
    let els = AT.$$('[data-reveal]');
    if (!els.length) {
      els = AT.$$('.section .wrap > *');
      els.forEach(el => el.setAttribute('data-reveal', ''));
    }
    if (AT.reduceMotion || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }

    /* Retraso escalonado entre hermanos (tarjetas de una misma fila) */
    els.forEach(el => {
      const hermanos = [...el.parentElement.children].filter(h => h.hasAttribute('data-reveal'));
      const i = hermanos.indexOf(el);
      if (i > 0) el.style.setProperty('--d', Math.min(i, 5) * .08 + 's');
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach(el => io.observe(el));
    AT.alSalir(() => io.disconnect());
  }
};
