/* =========================================================
   Diagnóstico "¿Qué le pasa a tu ordenador?"
   Botones de síntomas + orden de trabajo con la solución.
   Los datos están en js/data/sintomas.js
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.diagnostico = {
  init() {
    const box = AT.$('#symptoms'), body = AT.$('#ticket-body'), no = AT.$('#ticket-no');
    if (!box || !body) return;

    box.innerHTML = AT.SINTOMAS.map((s, i) =>
      `<button type="button" class="sym" aria-pressed="false" data-i="${i}">${AT.svg(s.icon)}<span>${AT.esc(s.label)}</span></button>`).join('');

    /* Número de orden: fecha de hoy + número del síntoma (siempre el mismo para el mismo caso) */
    const d = new Date(), stamp = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}`;

    box.addEventListener('click', e => {
      const b = e.target.closest('.sym'); if (!b) return;
      const i = +b.dataset.i, s = AT.SINTOMAS[i], svc = AT.servicio(s.svc);
      AT.$$('.sym', box).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      if (no) no.textContent = `Nº ${stamp}-${String(i + 1).padStart(2, '0')}`;
      body.innerHTML = `
        <h3>${AT.esc(s.label)}</h3>
        <dl>
          <dt>Causa probable</dt><dd>${AT.esc(s.cause)}</dd>
          <dt>Qué haría</dt><dd>${AT.esc(s.fix)}</dd>
          <dt>Servicio</dt><dd><a href="#svc-${s.svc}">${AT.esc(svc?.name || '')}</a></dd>
        </dl>
        <div class="acts">
          <button class="btn btn--primary" type="button" data-go>Pedir presupuesto</button>
          <a class="btn btn--link" href="${AT.esc(AT.mailLink('Mi ordenador: ' + s.label.toLowerCase(), 'Hola Alextoll, mi ordenador: ' + s.label.toLowerCase() + '. '))}">Contármelo por email${AT.svg('arrow')}</a>
        </div>
        <p class="note">Orientativo. El diagnóstico real lo hago viendo el equipo.</p>`;
      AT.$('[data-go]', body).addEventListener('click', () =>
        AT.prefillContact({ servicio: svc?.name, mensaje: `Hola, mi ordenador: ${s.label.toLowerCase()}. ` }));
      /* En móvil la orden queda debajo de los botones: la enseñamos */
      if (matchMedia('(max-width: 899px)').matches) AT.reveal(body.closest('.ticket'));
    });
  }
};
