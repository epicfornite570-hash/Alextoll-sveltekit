/* =========================================================
   Lista de servicios (como una tarifa) y opciones del
   desplegable del formulario. Datos en js/data/servicios.js
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.servicios = {
  /* Primera letra en minúscula para encadenar en una frase, salvo nombres propios */
  PROPIOS: /^(Windows|Linux|Office|Mac|RAM|SSD|PC)\b/,
  minus(s) { return this.PROPIOS.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1); },

  init() {
    const list = AT.$('#services');

    if (list) {
      list.innerHTML = AT.SERVICIOS.map(s => `
        <article class="svc" id="svc-${s.id}">
          <h3>${AT.svg(s.icon)}${AT.esc(s.name)}</h3>
          <div>
            <p>${AT.esc(s.text)}</p>
            <p class="inc">${AT.t('Incluye', 'Includes')}: ${s.items.map(i => AT.esc(this.minus(i))).join(', ')}.</p>
            ${s.paginas?.length ? `<p class="inc">${AT.t('Más información', 'More information')}: ${s.paginas.map(([t, u]) => `<a href="${AT.esc(u)}">${AT.esc(this.minus(t))}</a>`).join(', ')}.</p>` : ''}
          </div>
          <span class="price">${s.desde ? `${AT.t('Desde', 'From')} ${s.desde} €` : AT.t('A presupuesto', 'Quote on request')}</span>
        </article>`).join('');
    }

    /* data-fijo: el desplegable ya trae sus opciones (p. ej. webs.html) */
    const sel = AT.$('#f-servicio');
    if (sel && !('fijo' in sel.dataset)) {
      sel.innerHTML = AT.t('<option value="No lo sé">No lo sé, que me aconseje</option>', '<option value="Not sure">Not sure, I would like advice</option>') +
        AT.SERVICIOS.map(s => `<option value="${AT.esc(s.name)}">${AT.esc(s.name)}</option>`).join('');
    }
  }
};
