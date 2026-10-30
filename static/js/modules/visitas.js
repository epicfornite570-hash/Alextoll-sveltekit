/* =========================================================
   Contador de visitas (lado del navegador)
   ---------------------------------------------------------
   Avisa a /api/visita (netlify/functions/visita.mjs) de:
   - cada página que se abre
   - cada clic en WhatsApp, llamar o email, y cada formulario enviado

   No usa cookies ni guarda nada en el navegador del visitante.
   SOLO cuenta si el visitante acepta las estadísticas en la ventana
   de cookies (js/modules/cookies.js). Si acepta más tarde, se cuenta
   en ese momento la página en la que está.
   Tampoco cuenta si: se abre en local, el navegador pide no ser rastreado
   (Do Not Track / Global Privacy Control) o tú lo has desactivado
   en el panel de estadísticas para tu navegador.
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.visitas = {
  URL: '/api/visita',

  activo() {
    if (location.protocol === 'file:' || /^(localhost|127\.|\[::1\])/.test(location.hostname)) return false;
    if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl) return false;
    if (AT.store.get('alextoll_no_contar')) return false;
    const ck = AT.modules.cookies;
    if (!ck || !ck.estadisticas()) return false;
    return true;
  },

  /* Lo llama cookies.js al aceptar: cuenta la página actual (una vez) */
  consentido() {
    if (this.contada) return;
    this.contada = true;
    this.enviar({ p: location.pathname, r: document.referrer });
  },

  enviar(datos) {
    if (!this.activo()) return;
    const cuerpo = JSON.stringify(datos);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(this.URL, new Blob([cuerpo], { type: 'application/json' }))) return;
    } catch (e) {}
    fetch(this.URL, { method: 'POST', body: cuerpo, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  },

  init() {
    /* Para que otros módulos avisen de algo: AT.track('formulario') */
    AT.track = (evento) => this.enviar({ e: evento });

    this.contada = false;
    if (this.activo()) this.consentido();

    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[href]'); if (!a) return;
      const h = a.getAttribute('href');
      if (/wa\.me\//.test(h)) AT.track('whatsapp');
      else if (h.startsWith('tel:')) AT.track('llamada');
      else if (h.startsWith('mailto:')) AT.track('email');
    }, { capture: true, signal: AT.pagina.signal });
  }
};
