/* =========================================================
   Placa base de la portada (dibujo técnico, sección #placa)
   Cada pieza de AT.PIEZAS (data/placa.js) tiene un número en
   el dibujo y en la leyenda. Al pulsarlo se resalta la pieza
   y se muestra su ficha.
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.board = {
  W: 640, H: 520, // tamaño del dibujo (viewBox del SVG)

  init() {
    const board = AT.$('#board'), card = AT.$('#part-card'), legend = AT.$('#part-legend');
    if (!board || !card || !AT.PIEZAS) return;
    const svg = AT.$('.board-svg', board);
    const num = (i) => `<span class="num" aria-hidden="true">${i + 1}</span>`;

    /* Números sobre el dibujo */
    AT.PIEZAS.forEach((p, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hotspot';
      b.style.setProperty('--x', (p.x / this.W * 100) + '%');
      b.style.setProperty('--y', (p.y / this.H * 100) + '%');
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', `${i + 1}. ${p.title}`);
      b.dataset.i = i;
      b.innerHTML = num(i);
      board.appendChild(b);
    });

    /* Leyenda con los mismos números */
    if (legend) {
      legend.innerHTML = AT.PIEZAS.map((p, i) =>
        `<li><button type="button" data-i="${i}" aria-pressed="false">${num(i)}${AT.esc(p.title)}</button></li>`).join('');
    }

    const show = (i) => {
      const p = AT.PIEZAS[i], svc = AT.servicio(p.svc);
      AT.$$('[data-i]', board).concat(legend ? AT.$$('button', legend) : [])
        .forEach(h => h.setAttribute('aria-pressed', String(+h.dataset.i === i)));
      AT.$$('.part', svg).forEach(g => g.classList.toggle('is-on', g.dataset.part === p.part));
      card.innerHTML = `
        <span class="code">${i + 1}. ${AT.esc(p.code)}</span>
        <h3>${AT.esc(p.title)}</h3>
        <p>${AT.esc(p.text)}</p>
        <div class="acts">
          <button class="btn btn--primary btn--sm" type="button" data-go>Pedir presupuesto</button>
          <a class="btn btn--link" href="${AT.esc(AT.mailLink('Consulta: ' + p.title.toLowerCase(), 'Hola Alextoll, te escribo por: ' + p.title.toLowerCase() + '. '))}">Preguntar por email${AT.svg('arrow')}</a>
        </div>`;
      AT.$('[data-go]', card).addEventListener('click', () =>
        AT.prefillContact({ servicio: svc?.name, mensaje: `Hola, te escribo por: ${p.title.toLowerCase()}. ` }));
    };

    const pick = (e) => {
      const b = e.target.closest('[data-i]'); if (!b) return;
      show(+b.dataset.i);
      AT.reveal(card); // en móvil la ficha puede quedar por debajo de la pantalla
    };
    board.addEventListener('click', pick);
    legend?.addEventListener('click', pick);

    /* Flechas del teclado para pasar de una pieza a otra (en el dibujo) */
    board.addEventListener('keydown', e => {
      const h = e.target.closest('.hotspot'); if (!h) return;
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
      e.preventDefault();
      const all = AT.$$('.hotspot', board), n = (all.indexOf(h) + d + all.length) % all.length;
      all[n].focus(); show(n);
    });
  }
};
