/* =========================================================
   Ventana de cookies
   ---------------------------------------------------------
   Sale en la primera visita (y cuando cambia VERSION) hasta que
   el visitante elige. Aceptar y Rechazar pesan lo mismo.
   - Necesarias: siempre activas (guardan la elección, borradores...).
   - Estadísticas: el contador propio (js/modules/visitas.js) SOLO
     cuenta si se aceptan. Sin elección todavía, no cuenta.
   Se vuelve a abrir desde "Configurar cookies" (data-open-cookies).
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.cookies = {
  KEY: 'alextoll_consent',
  DAYS: 180,
  /* Súbela si cambia lo que se pide (vuelve a preguntar a todos) */
  VERSION: 2,

  read() {
    let v = null;
    try { const m = document.cookie.match(new RegExp('(?:^|; )' + this.KEY + '=([^;]*)')); if (m) v = JSON.parse(decodeURIComponent(m[1])); } catch (e) {}
    if (!v) v = AT.store.get(this.KEY);
    return v && v.v === this.VERSION ? v : null;
  },

  /* ¿Ha aceptado las estadísticas? (lo usa visitas.js) */
  estadisticas() { const c = this.read(); return !!(c && c.estadisticas); },

  save(stats) {
    const v = { v: this.VERSION, necesarias: true, estadisticas: !!stats, fecha: new Date().toISOString() };
    try { document.cookie = `${this.KEY}=${encodeURIComponent(JSON.stringify(v))}; Max-Age=${60 * 60 * 24 * this.DAYS}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`; } catch (e) {}
    AT.store.set(this.KEY, v);
    this.apply(v);
  },

  apply(v) {
    if (!v || !v.estadisticas) return;
    if (AT.modules.visitas && AT.modules.visitas.consentido) AT.modules.visitas.consentido();
    if (AT.config.statsScript && !window.__statsLoaded) {
      window.__statsLoaded = true;
      const s = document.createElement('script'); s.defer = true; s.src = AT.config.statsScript;
      document.head.appendChild(s);
    }
  },

  init() {
    const banner = AT.$('#cookie'); if (!banner) return;
    const prefs = AT.$('#ck-prefs'), stats = AT.$('#ck-stats');
    const btn = (id) => AT.$('#' + id);
    const sig = { signal: AT.pagina.signal };
    let abierta = false, vuelta = null;

    const modo = (conf) => {
      prefs.hidden = !conf; btn('ck-save').hidden = !conf;
      btn('ck-all').hidden = conf; btn('ck-none').hidden = conf; btn('ck-conf').hidden = conf;
      banner.classList.toggle('is-conf', conf);
    };

    const open = (conf, desde) => {
      vuelta = desde || null;
      const c = this.read();
      stats.checked = !!(c && c.estadisticas);
      /* La X solo si ya hay una elección: la primera vez hay que elegir */
      btn('ck-x').hidden = !c;
      modo(conf);
      if (!abierta) {
        abierta = true;
        clearTimeout(this.t);
        banner.classList.remove('is-in');
        banner.hidden = false;
        void banner.offsetWidth;               // para que la entrada se anime
        banner.classList.add('is-in');
      }
      /* Al salir sola no roba el foco; si la abre el visitante, sí */
      if (conf) stats.focus({ preventScroll: true });
    };

    const close = (msg) => {
      if (!abierta) return;
      abierta = false;
      banner.classList.remove('is-in');
      const fin = () => { if (!abierta) banner.hidden = true; };
      if (AT.reduceMotion) fin(); else this.t = setTimeout(fin, 320);
      if (msg) AT.toast(msg);
      if (vuelta && document.contains(vuelta)) vuelta.focus({ preventScroll: true });
    };

    const ok = banner.dataset.ok, solo = banner.dataset.solo;
    btn('ck-all').addEventListener('click', () => { this.save(true); close(ok); }, sig);
    btn('ck-none').addEventListener('click', () => { this.save(false); close(solo); }, sig);
    btn('ck-conf').addEventListener('click', () => open(true), sig);
    btn('ck-save').addEventListener('click', () => { this.save(stats.checked); close(stats.checked ? ok : solo); }, sig);
    btn('ck-x').addEventListener('click', () => close(), sig);
    banner.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.read()) close(); }, sig);
    AT.$$('[data-open-cookies]').forEach(b => b.addEventListener('click', () => open(true, b), sig));
    AT.alSalir && AT.alSalir(() => clearTimeout(this.t));

    const existing = this.read();
    if (existing) this.apply(existing);
    else this.t = setTimeout(() => open(false), 700);
  }
};
