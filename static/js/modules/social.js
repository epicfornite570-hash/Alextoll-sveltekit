/* =========================================================
   Opiniones de clientes y trabajos realizados.
   Datos en js/data/opiniones.js.
   - Opiniones: la sección solo aparece si hay alguna.
   - Trabajos: si hay alguno, sustituye a los huecos de ejemplo.
     Con foto de antes y de después se ve un comparador que se arrastra.
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.social = {
  init() {
    const ops = AT.OPINIONES || [], trab = AT.TRABAJOS || [];

    const secOp = AT.$('#opiniones'), listOp = AT.$('#quotes');
    if (secOp && listOp && ops.length) {
      listOp.innerHTML = ops.map(o => {
        const n = Math.max(0, Math.min(5, o.estrellas || 0));
        return `
        <figure class="card quote">
          ${n ? `<span class="stars" role="img" aria-label="${n} ${AT.t('de 5 estrellas', 'out of 5 stars')}">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>` : ''}
          <blockquote>${AT.esc(o.texto)}</blockquote>
          <figcaption><b>${AT.esc(o.nombre)}</b>${o.lugar ? `, ${AT.esc(o.lugar)}` : ''}${o.servicio ? `, ${AT.esc(o.servicio)}` : ''}</figcaption>
        </figure>`;
      }).join('');
      secOp.hidden = false;
    }

    const listTr = AT.$('#works');
    if (listTr && trab.length) {
      listTr.innerHTML = trab.map((t, i) => {
        const alt = AT.esc(t.alt || t.titulo);
        const media = t.antes && t.despues ? `
          <div class="ba">
            <img src="${AT.esc(AT.ruta(t.antes))}" alt="${alt}, ${AT.t('antes', 'before')}" loading="lazy" width="800" height="500">
            <img class="ba-after" src="${AT.esc(AT.ruta(t.despues))}" alt="${alt}, ${AT.t('después', 'after')}" loading="lazy" width="800" height="500">
            <span class="ba-line"></span>
            <input type="range" min="0" max="100" value="50" aria-label="${AT.t('Comparar antes y después', 'Compare before and after')}: ${AT.esc(t.titulo)}">
            <span class="ba-handle">${AT.lsvg('lSlide')}</span>
            <span class="ba-tag ba-tag--a">${AT.t('Antes', 'Before')}</span><span class="ba-tag ba-tag--d">${AT.t('Después', 'After')}</span>
          </div>` : t.foto ? `<div class="ba"><img src="${AT.esc(AT.ruta(t.foto))}" alt="${alt}" loading="lazy" width="800" height="500"></div>` : '';
        return `
        <article class="card wcard">${media}
          <div class="wcard-body"><h3>${AT.esc(t.titulo)}</h3>${t.detalle ? `<p>${AT.esc(t.detalle)}</p>` : ''}</div>
        </article>`;
      }).join('');
      AT.$('#works-note')?.setAttribute('hidden', '');
      listTr.addEventListener('input', e => {
        const r = e.target.closest('.ba input'); if (r) r.closest('.ba').style.setProperty('--pos', r.value + '%');
      });
    }
  }
};
