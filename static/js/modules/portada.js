/* =========================================================
   Portada: indicadores de confianza, precios orientativos
   y flechas del carrusel de trabajos.
   - Indicadores: AT.config.confianza (js/config.js)
   - Precios: campo "desde" de js/data/servicios.js
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.portada = {
  init() {
    /* Indicadores: solo los que tienen dato, como mucho cuatro */
    const stats = AT.$('#stats'), items = (AT.config.confianza || []).filter(c => c.valor);
    if (stats && items.length) {
      /* En inglés, los textos de c.en (si el dato es un número, el número se queda) */
      const txt = (c) => AT.lang === 'en' && c.en ? [c.en[0] || c.valor, c.en[1] || c.texto] : [c.valor, c.texto];
      stats.innerHTML = items.slice(0, 4).map(c => {
        const [v, t] = txt(c);
        return `<li>${AT.lsvg(c.icono)}<div><strong>${AT.esc(v)}</strong><span>${AT.esc(t || '')}</span></div></li>`;
      }).join('');
    }

    /* Precios: "Desde X €" solo si el servicio tiene precio puesto */
    AT.$$('#tiles [data-svc]').forEach(t => {
      const s = AT.servicio(t.dataset.svc); if (!s || !s.desde) return;
      AT.$('.from', t).textContent = AT.t('Desde', 'From');
      const v = AT.$('.val', t);
      v.textContent = `${s.desde} €`;
      v.classList.remove('val--txt');
    });

    /* Carrusel de trabajos: las flechas desplazan una tarjeta */
    const works = AT.$('#works');
    AT.$$('[data-scroll]').forEach(b => b.addEventListener('click', () => {
      if (!works) return;
      const card = works.firstElementChild, paso = card ? card.getBoundingClientRect().width + 18 : 300;
      works.scrollBy({ left: paso * +b.dataset.scroll, behavior: AT.reduceMotion ? 'auto' : 'smooth' });
    }));
  }
};
