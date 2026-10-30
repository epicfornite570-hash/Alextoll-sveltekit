/* =========================================================
   Portada (index.html): las tarjetas de los tres caminos
   se iluminan donde está el ratón (borde y brillo suave).
   Solo con ratón y sin "reducir movimiento".
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.marca = {
  init() {
    const cards = AT.$$('.mk-card'); if (!cards.length) return;
    if (AT.reduceMotion || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    cards.forEach(card => {
      let raf = 0, x = 0, y = 0;
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        x = e.clientX - r.left; y = e.clientY - r.top;
        if (!raf) raf = requestAnimationFrame(() => {
          card.style.setProperty('--mx', x + 'px');
          card.style.setProperty('--my', y + 'px');
          raf = 0;
        });
      });
    });
  }
};
