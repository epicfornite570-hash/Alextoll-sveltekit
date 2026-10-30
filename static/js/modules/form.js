/* =========================================================
   Formulario de contacto
   - Validación con mensajes claros
   - Envío con Web3Forms (si hay clave en config.js) o a Netlify Forms / Formspree
   - Guarda un borrador en el navegador por si se cierra la página
   - Si falla el envío, ofrece el email con el mensaje ya escrito
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.form = {
  DRAFT: 'alextoll_borrador',
  MAX: 1500,

  init() {
    const form = AT.$('#form'); if (!form) return;
    const statusBox = AT.$('#f-status'), btn = AT.$('#f-send'), msg = AT.$('#f-mensaje'), counter = AT.$('#f-count');
    const fields = ['nombre', 'contacto', 'servicio', 'mensaje'];
    /* Cada formulario guarda su propio borrador (data-borrador) y puede llevar su asunto (data-asunto) */
    const DRAFT = form.dataset.borrador || this.DRAFT;

    const setErr = (id, text) => {
      const e = AT.$('#e-' + id); if (!e) return;
      e.textContent = text;
      const f = e.closest('.field'); if (f) f.classList.toggle('invalid', !!text);
      const input = AT.$('#f-' + id);
      if (input) { input.setAttribute('aria-invalid', String(!!text)); }
    };
    const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const isPhone = v => /^\+?[\d\s-]{9,}$/.test(v) && v.replace(/\D/g, '').length >= 9;

    /* Contador de caracteres */
    if (msg) {
      msg.maxLength = this.MAX;
      const upd = () => { if (counter) counter.textContent = `${msg.value.length} / ${this.MAX}`; };
      msg.addEventListener('input', upd); upd();
    }

    /* Borrador: se guarda al escribir y se recupera al volver */
    const saveDraft = () => {
      const d = {}; fields.forEach(k => { d[k] = AT.$('#f-' + k)?.value || ''; });
      if (d.nombre || d.contacto || d.mensaje) AT.store.set(DRAFT, d); else AT.store.del(DRAFT);
    };
    let t; form.addEventListener('input', () => { clearTimeout(t); t = setTimeout(saveDraft, 400); });
    const draft = AT.store.get(DRAFT), note = AT.$('#f-draft');
    if (draft && (draft.nombre || draft.mensaje)) {
      fields.forEach(k => { const el = AT.$('#f-' + k); if (el && draft[k]) el.value = draft[k]; });
      msg?.dispatchEvent(new Event('input'));
      if (note) {
        note.hidden = false;
        AT.$('button', note)?.addEventListener('click', () => {
          form.reset(); AT.store.del(DRAFT); note.hidden = true; msg?.dispatchEvent(new Event('input'));
        });
      }
    }

    /* Si se llega desde una página de servicio (ordenadores.html?servicio=...#contacto),
       se elige ese servicio en el desplegable */
    const pedido = new URLSearchParams(location.search).get('servicio');
    /* Mensaje ya escrito desde el diagnóstico rápido (diagnostico.html) */
    const texto = new URLSearchParams(location.search).get('mensaje');
    const sel = AT.$('#f-servicio');
    if (pedido && sel && [...sel.options].some(o => o.value === pedido)) {
      sel.value = pedido;
      if (msg && !msg.value.trim() && !texto) { msg.value = AT.t(`Hola, te escribo por: ${pedido.toLowerCase()}. `, `Hi, I'm writing about: ${pedido.toLowerCase()}. `); msg.dispatchEvent(new Event('input')); }
    }
    if (texto && msg && !msg.value.trim()) { msg.value = texto.slice(0, this.MAX); msg.dispatchEvent(new Event('input')); }

    /* Validación al salir de cada campo (solo si ya hay algo escrito) */
    const rules = {
      nombre: v => v.length < 2 ? AT.t('Escribe tu nombre.', 'Please enter your name.') : '',
      contacto: v => !isEmail(v) && !isPhone(v) ? AT.t('Pon un teléfono (9 cifras) o un email válido.', 'Please enter a phone number (9+ digits) or a valid email.') : '',
      mensaje: v => v.length < 10 ? AT.t('Cuéntame un poco más (mínimo 10 caracteres).', 'Tell me a bit more (at least 10 characters).') : ''
    };
    Object.keys(rules).forEach(k => {
      const el = AT.$('#f-' + k);
      el?.addEventListener('blur', () => { if (el.value.trim()) setErr(k, rules[k](el.value.trim())); });
      el?.addEventListener('input', () => { if (el.closest('.field')?.classList.contains('invalid')) setErr(k, rules[k](el.value.trim())); });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const v = (k) => AT.$('#f-' + k).value.trim();
      let ok = true;
      Object.keys(rules).forEach(k => { const m = rules[k](v(k)); setErr(k, m); if (m) ok = false; });
      const priv = AT.$('#f-priv');
      AT.$('#e-priv').textContent = priv.checked ? '' : AT.t('Necesito que aceptes la política de privacidad para responderte.', 'Please accept the privacy policy so I can reply to you.');
      if (!priv.checked) ok = false;
      if (!ok) { form.querySelector('[aria-invalid="true"], #f-priv:not(:checked)')?.focus(); return; }

      btn.disabled = true; btn.textContent = AT.t('Enviando…', 'Sending…');
      statusBox.hidden = true;
      const endpoint = AT.config.formEndpoint || '/';
      try {
        const data = new FormData(form);
        if (data.get('empresa')) throw new Error('spam');   // campo trampa relleno: es un robot
        /* Primero el servidor propio (/api/contacto: límites y antispam); si no responde, Web3Forms */
        const r = await this.servidor(data, form.dataset.asunto);
        if (r === 'ok') { /* enviado */ }
        else if (AT.config.web3formsKey) await this.web3forms(data, isEmail, form.dataset.asunto);
        else {
          const res = await fetch(endpoint, endpoint === '/'
            ? { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data).toString() }
            : { method: 'POST', headers: { 'Accept': 'application/json' }, body: data });
          if (!res.ok) throw new Error(res.status);
        }
        statusBox.className = 'status ok';
        statusBox.textContent = AT.t(`Gracias, ${v('nombre').split(' ')[0]}. Tu mensaje me ha llegado. Te respondo lo antes posible.`,
          `Thanks, ${v('nombre').split(' ')[0]}. Your message has reached me. I will reply as soon as I can.`);
        AT.track?.('formulario');
        form.reset(); AT.store.del(DRAFT); msg?.dispatchEvent(new Event('input'));
        if (note) note.hidden = true;
      } catch (err) {
        statusBox.className = 'status bad';
        if (err.mostrar) { statusBox.textContent = err.message; return; }
        const mail = AT.esc(AT.mailLink('', AT.t(`Hola Alextoll, soy ${v('nombre')}. ${v('mensaje')}`, `Hi Alextoll, I'm ${v('nombre')}. ${v('mensaje')}`)));
        statusBox.innerHTML = AT.t(`No se ha podido enviar ahora mismo. Tu mensaje sigue guardado aquí. Mándamelo por <a href="${mail}">email</a> a ${AT.esc(AT.config.email)}.`,
          `It couldn't be sent right now. Your message is still saved here. Send it to me by <a href="${mail}">email</a> at ${AT.esc(AT.config.email)}.`);
      } finally {
        statusBox.hidden = false; btn.disabled = false; btn.textContent = AT.t('Enviar mensaje', 'Send message');
      }
    });
  },

  /* Envío al servidor propio (servidor/api.mjs → n8n → correo).
     Devuelve 'ok' o 'fallo' (no hay servidor o no responde: probar Web3Forms).
     Si el servidor no acepta los datos o hay demasiados envíos seguidos, lanza un
     error con el texto para la persona (err.mostrar). */
  async servidor(data, asunto) {
    let res;
    try {
      res = await fetch('/api/contacto', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          nombre: data.get('nombre'), contacto: String(data.get('contacto') || '').trim(), servicio: data.get('servicio') || '',
          mensaje: data.get('mensaje'), asunto: asunto || '', idioma: AT.lang === 'en' ? 'en' : 'es',
          pagina: location.pathname, empresa: data.get('empresa') || '', ms: Math.round(performance.now())
        }),
        signal: AbortSignal.timeout ? AbortSignal.timeout(35000) : undefined
      });
    } catch (e) { return 'fallo'; }
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) return 'ok';
    const aviso = (texto) => { const e = new Error(texto); e.mostrar = true; return e; };
    if (res.status === 429) throw aviso(AT.t('Has mandado varios mensajes seguidos. Espera un rato o escríbeme por email.', 'You have sent several messages in a row. Please wait a while or email me.'));
    if (res.status === 400) throw aviso(json.mensaje ? AT.t(json.mensaje, json.message || json.mensaje) : AT.t('Revisa los datos del formulario.', 'Please check the form details.'));
    return 'fallo';
  },

  /* Envío por Web3Forms (plan B): te llega un correo con todos los datos.
     Si la persona dejó un email, al pulsar "Responder" le contestas directamente. */
  async web3forms(data, isEmail, asunto) {
    const contacto = String(data.get('contacto') || '').trim();
    const cuerpo = {
      access_key: AT.config.web3formsKey,
      subject: asunto ? `${asunto}: mensaje de ${data.get('nombre')}` : `Nuevo mensaje de ${data.get('nombre')} desde la web de Alextoll`,
      from_name: 'Web de Alextoll',
      ...(AT.lang === 'en' ? { Idioma: 'Inglés (escribió desde la web en inglés)' } : {}),
      Nombre: data.get('nombre'),
      'Teléfono o email': contacto,
      Servicio: data.get('servicio'),
      Mensaje: data.get('mensaje'),
      botcheck: ''
    };
    if (isEmail(contacto)) cuerpo.replyto = contacto;
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(cuerpo)
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.message || res.status);
  }
};
