/* =========================================================
   Datos de contacto: botones de copiar, enlaces de email,
   zona de trabajo y año del pie. Todo sale de js/config.js
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.contacto = {
  init() {
    const c = AT.config;

    /* Enlaces de email: <a data-mail> o <a data-mail="asunto" data-mail-texto="texto"> */
    AT.$$('[data-mail]').forEach(a => { a.href = AT.mailLink(a.dataset.mail, a.dataset.mailTexto); });

    /* Copiar al portapapeles: <button data-copy="texto"> */
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-copy]'); if (!b) return;
      const txt = b.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject())
        .then(() => AT.toast(AT.t('Copiado: ', 'Copied: ') + txt))
        .catch(() => AT.toast(txt));
    }, { signal: AT.pagina.signal });

    /* Zona de trabajo (solo si está rellenada en config.js) */
    if (c.zona) {
      AT.$$('[data-zona]').forEach(el => { el.textContent = c.zona; });
      AT.$$('[data-zona-wrap]').forEach(el => { el.hidden = false; });
      const faq = AT.$('#faq-zona');
      if (faq) faq.textContent = AT.t(
        `Trabajo en ${c.zona}, sobre todo los fines de semana. ${c.aDomicilio ? 'Puedo pasar a recoger el equipo o ir a tu casa.' : 'Me lo acercas o quedamos para recogerlo.'} Muchas cosas de programas y configuración se pueden resolver en remoto.`,
        `I work in ${c.zona}, mostly at weekends. ${c.aDomicilio ? 'I can pick up the computer or come to your home.' : 'You bring it to me or we meet so I can pick it up.'} Many software and setup issues can be solved remotely.`);
    }

    /* Año actual en el pie */
    AT.$$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  }
};
