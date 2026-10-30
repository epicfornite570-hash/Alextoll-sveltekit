/* =========================================================
   Reparación de móviles: formulario de presupuesto (reparacion-moviles.html)
   - Validación con mensajes claros
   - Fotos opcionales (hasta 3): se reducen en el navegador a 1600 px en JPG,
     así pesan poco y pierden los datos ocultos de la foto (como la ubicación)
   - Envío a /api/presupuesto-movil (servidor/api.mjs → n8n → correo con las fotos)
   - Si el servidor no responde, se manda por Web3Forms sin fotos para que no se pierda
   - El aviso de "enviado" solo sale cuando el envío ha ido bien de verdad
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.moviles = {
  MAX_FOTOS: 3,
  LADO: 1600,             // lado mayor de cada foto al reducirla
  CALIDAD: .82,
  MAX_ORIGINAL: 30e6,     // fotos de más de 30 MB ni se intentan abrir
  BORRADOR: 'alextoll_borrador_movil',
  CAMPOS: ['nombre', 'email', 'marca', 'modelo', 'problema', 'descripcion'],

  init() {
    const form = AT.$('#form-movil'); if (!form) return;
    const $ = (id) => AT.$('#m-' + id);
    const statusBox = $('status'), btn = $('send'), ok = $('ok');
    const textoBoton = btn.innerHTML;
    const t0 = Date.now();
    let fotos = [];          // { id, nombre, datos (base64), url (data: para la miniatura) }
    let ocupado = 0;         // fotos que se están reduciendo

    const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const setErr = (id, text) => {
      const e = AT.$('#e-m-' + id); if (!e) return;
      e.textContent = text;
      e.closest('.field')?.classList.toggle('invalid', !!text);
      $(id)?.setAttribute('aria-invalid', String(!!text));
    };
    const rules = {
      nombre: v => v.length < 2 ? AT.t('Escribe tu nombre.', 'Please enter your name.') : '',
      email: v => !isEmail(v) ? AT.t('Escribe un email válido: te mando el presupuesto ahí.', 'Please enter a valid email: I will send the quote there.') : '',
      marca: v => v.length < 2 ? AT.t('Escribe la marca del móvil.', 'Please enter the phone brand.') : '',
      modelo: v => v.length < 2 ? AT.t('Escribe el modelo exacto (por ejemplo, Galaxy A54).', 'Please enter the exact model (for example, Galaxy A54).') : '',
      problema: v => !v ? AT.t('Elige el tipo de problema.', 'Please choose the type of problem.') : ''
    };
    const val = (k) => ($(k)?.value || '').trim();

    /* Validación al salir de cada campo (si ya hay algo escrito) y al corregir */
    Object.keys(rules).forEach(k => {
      const el = $(k);
      el?.addEventListener(el.tagName === 'SELECT' ? 'change' : 'blur', () => { if (el.value.trim() || el.tagName === 'SELECT') setErr(k, rules[k](val(k))); });
      el?.addEventListener('input', () => { if (el.closest('.field')?.classList.contains('invalid')) setErr(k, rules[k](val(k))); });
    });

    /* Contador de la descripción */
    const desc = $('descripcion'), contador = $('count');
    const contar = () => { if (contador) contador.textContent = `${desc.value.length} / ${desc.maxLength}`; };
    desc?.addEventListener('input', contar); contar();

    /* Borrador (solo los textos; las fotos no se guardan) */
    const guardar = () => {
      const d = {}; this.CAMPOS.forEach(k => { d[k] = $(k)?.value || ''; });
      if (d.nombre || d.email || d.modelo || d.descripcion) AT.store.set(this.BORRADOR, d); else AT.store.del(this.BORRADOR);
    };
    let tg; form.addEventListener('input', () => { clearTimeout(tg); tg = setTimeout(guardar, 400); });
    const borrador = AT.store.get(this.BORRADOR);
    if (borrador) { this.CAMPOS.forEach(k => { const el = $(k); if (el && borrador[k] && !el.value) el.value = borrador[k]; }); contar(); }

    /* "Pedir presupuesto por esto" en las tarjetas de problemas: elige ese problema */
    AT.$$('[data-problema]').forEach(a => a.addEventListener('click', () => {
      const sel = $('problema');
      if (sel && [...sel.options].some(o => o.value === a.dataset.problema)) { sel.value = a.dataset.problema; setErr('problema', ''); guardar(); }
    }));

    /* ---------- Fotos ---------- */
    const input = $('fotos'), drop = $('drop'), lista = $('thumbs');
    const textoDrop = AT.$('span', drop);
    const pintar = () => {
      lista.innerHTML = fotos.map(f => `<li><img src="${f.url}" alt="${AT.esc(f.nombre)}"><button type="button" data-quitar="${f.id}" aria-label="${AT.esc(AT.t('Quitar la foto', 'Remove photo'))} ${AT.esc(f.nombre)}">${AT.lsvg('lClose')}</button></li>`).join('')
        + Array.from({ length: ocupado }, () => `<li class="is-cargando">${AT.t('Preparando…', 'Preparing…')}</li>`).join('');
      drop.hidden = fotos.length + ocupado >= this.MAX_FOTOS;
      textoDrop.textContent = fotos.length ? textoDrop.dataset.mas : textoDrop.dataset.una;
    };
    lista.addEventListener('click', e => {
      const b = e.target.closest('[data-quitar]'); if (!b) return;
      fotos = fotos.filter(f => f.id !== b.dataset.quitar);
      setErr('fotos', ''); pintar(); input.focus();
    });
    const anadir = async (archivos) => {
      setErr('fotos', '');
      const avisos = [];
      for (const archivo of archivos) {
        if (fotos.length + ocupado >= this.MAX_FOTOS) { avisos.push(AT.t(`Como mucho ${this.MAX_FOTOS} fotos.`, `${this.MAX_FOTOS} photos at most.`)); break; }
        if (!/^image\//.test(archivo.type) && !/\.(jpe?g|png|webp|gif|heic|heif|avif)$/i.test(archivo.name)) { avisos.push(AT.t(`«${archivo.name}» no es una foto.`, `"${archivo.name}" is not a photo.`)); continue; }
        if (archivo.size > this.MAX_ORIGINAL) { avisos.push(AT.t(`«${archivo.name}» es demasiado grande.`, `"${archivo.name}" is too big.`)); continue; }
        ocupado++; pintar();
        try {
          const url = await this.reducir(archivo);
          fotos.push({ id: Math.random().toString(36).slice(2), nombre: archivo.name.slice(0, 80) || 'foto.jpg', url, datos: url.split(',')[1] });
        } catch (err) {
          avisos.push(AT.t(`No puedo abrir «${archivo.name}». Prueba con una foto en JPG o PNG (o una captura de pantalla).`,
            `I can't open "${archivo.name}". Try a JPG or PNG photo (or a screenshot).`));
        } finally { ocupado--; pintar(); }
      }
      if (avisos.length) setErr('fotos', avisos.join(' '));
      input.value = '';
    };
    input.addEventListener('change', () => anadir([...input.files]));
    ['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, () => drop.classList.remove('is-over')));
    drop.addEventListener('drop', e => { e.preventDefault(); anadir([...(e.dataTransfer?.files || [])]); });

    /* ---------- Envío ---------- */
    const mostrarOk = (texto) => {
      AT.$('#m-ok-txt').textContent = texto;
      form.hidden = true; ok.hidden = false;
      ok.focus({ preventScroll: true });
      AT.scrollTo(ok.closest('.card'));
    };
    $('otra').addEventListener('click', () => {
      form.reset(); fotos = []; pintar(); contar(); statusBox.hidden = true;
      ok.hidden = true; form.hidden = false; $('nombre').focus();
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      let bien = true;
      Object.keys(rules).forEach(k => { const m = rules[k](val(k)); setErr(k, m); if (m) bien = false; });
      const priv = $('priv');
      AT.$('#e-m-priv').textContent = priv.checked ? '' : AT.t('Necesito que aceptes la política de privacidad para responderte.', 'Please accept the privacy policy so I can reply to you.');
      if (!priv.checked) bien = false;
      if (ocupado) { setErr('fotos', AT.t('Espera un momento: aún se están preparando las fotos.', 'Just a moment: the photos are still being prepared.')); bien = false; }
      if (!bien) { form.querySelector('[aria-invalid="true"], #m-priv:not(:checked), #m-fotos')?.focus(); return; }

      btn.disabled = true; btn.textContent = AT.t('Enviando…', 'Sending…');
      statusBox.hidden = true;
      const datos = {
        nombre: val('nombre'), email: val('email'), marca: val('marca'), modelo: val('modelo'), problema: val('problema'),
        reparacion: form.elements.reparacion?.value || 'pantalla', descripcion: val('descripcion'),
        idioma: AT.lang === 'en' ? 'en' : 'es', pagina: location.pathname,
        empresa: form.elements.empresa?.value || '', ms: Date.now() - t0,
        fotos: fotos.map(f => ({ nombre: f.nombre, datos: f.datos }))
      };
      const nombre = datos.nombre.split(' ')[0];
      const gracias = AT.t(`Gracias, ${nombre}. He recibido tu solicitud para tu ${datos.marca} ${datos.modelo}. Te escribiré a ${datos.email} con el presupuesto.`,
        `Thanks, ${nombre}. I have received your request for your ${datos.marca} ${datos.modelo}. I will email you the quote at ${datos.email}.`);
      const terminar = (texto) => {
        AT.track?.('formulario');
        AT.store.del(this.BORRADOR); fotos = []; pintar();
        mostrarOk(texto);
      };
      try {
        const r = await this.enviar(datos);
        if (r === 'ok') return terminar(gracias);
        if (r === 'muchas') throw this.aviso(AT.t('Has enviado varias solicitudes seguidas. Espera un rato y vuelve a probar, o escríbeme por email.',
          'You have sent several requests in a row. Please wait a while and try again, or email me.'));
        /* El servidor no está (p. ej. web abierta desde el PC) o no ha podido mandar el correo: plan B */
        if (!AT.config.web3formsKey) throw new Error('sin plan B');
        await this.web3forms(datos);
        terminar(gracias + (datos.fotos.length ? ' ' + AT.t('Las fotos no se han podido adjuntar: si quieres, mándamelas respondiendo a mi correo.',
          'The photos could not be attached: if you like, send them by replying to my email.') : ''));
      } catch (err) {
        statusBox.className = 'status bad';
        const cuerpo = AT.t(`Hola Alextoll, soy ${datos.nombre}. Quiero presupuesto para cambiar la pantalla de mi ${datos.marca} ${datos.modelo}. Problema: ${datos.problema}. ${datos.descripcion}`,
          `Hi Alextoll, I'm ${datos.nombre}. I would like a quote to replace the screen of my ${datos.marca} ${datos.modelo}. Problem: ${datos.problema}. ${datos.descripcion}`);
        const mail = AT.esc(AT.mailLink(AT.t('Presupuesto cambio de pantalla', 'Phone screen quote'), cuerpo));
        /* Solo se enseñan los avisos preparados (aviso()); un fallo técnico sale con un texto general */
        statusBox.innerHTML = (err.mostrar ? AT.esc(err.message) + ' ' : AT.t('No se ha podido enviar ahora mismo. ', 'It couldn\'t be sent right now. '))
          + AT.t(`Lo que has escrito sigue aquí. También puedes mandármelo por <a href="${mail}">email</a> a ${AT.esc(AT.config.email)}.`,
            `What you wrote is still here. You can also send it to me by <a href="${mail}">email</a> at ${AT.esc(AT.config.email)}.`);
        statusBox.hidden = false;
      } finally {
        btn.disabled = false; btn.innerHTML = textoBoton;
      }
    });
  },

  /* Abre la foto y la reduce a JPG (lado mayor LADO). Devuelve un data: URL.
     Se lee como data: (no blob:) porque la Content-Security-Policy de la web solo deja esas imágenes. */
  reducir(archivo) {
    return new Promise((ok, mal) => {
      const lector = new FileReader();
      lector.onerror = () => mal(lector.error);
      lector.onload = () => {
        const img = new Image();
        img.onerror = () => mal(new Error('formato'));
        img.onload = () => {
          const k = Math.min(1, this.LADO / Math.max(img.naturalWidth, img.naturalHeight));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
          const g = c.getContext('2d');
          g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);   // PNG con transparencia: fondo blanco
          g.drawImage(img, 0, 0, c.width, c.height);
          ok(c.toDataURL('image/jpeg', this.CALIDAD));
        };
        img.src = lector.result;
      };
      lector.readAsDataURL(archivo);
    });
  },

  /* Error con un texto pensado para la persona (se muestra tal cual en el formulario) */
  aviso(texto) { const e = new Error(texto); e.mostrar = true; return e; },

  /* Envío al servidor. Devuelve 'ok', 'muchas' (demasiadas seguidas) o 'fallo' (probar el plan B).
     Un 400 (datos que el servidor no acepta) se convierte en error con su explicación. */
  async enviar(datos) {
    let res;
    try {
      res = await fetch('/api/presupuesto-movil', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(datos), signal: AbortSignal.timeout ? AbortSignal.timeout(60000) : undefined
      });
    } catch (e) { return 'fallo'; }
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) return 'ok';
    if (res.status === 429) return 'muchas';
    if (res.status === 400) throw this.aviso(json.mensaje ? AT.t(json.mensaje, json.message || json.mensaje) : AT.t('Revisa los datos del formulario.', 'Please check the form details.'));
    return 'fallo';
  },

  /* Plan B: Web3Forms (el mismo servicio que el formulario de contacto). Sin fotos. */
  async web3forms(d) {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: AT.config.web3formsKey,
        subject: `Presupuesto pantalla: ${d.marca} ${d.modelo} · ${d.nombre}`,
        from_name: 'Web de Alextoll',
        replyto: d.email,
        ...(d.idioma === 'en' ? { Idioma: 'Inglés (escribió desde la web en inglés)' } : {}),
        Nombre: d.nombre, Email: d.email, Marca: d.marca, Modelo: d.modelo, Problema: d.problema,
        'Descripción': d.descripcion || '(sin descripción)',
        Fotos: d.fotos.length ? `${d.fotos.length} (no se pudieron adjuntar: el servidor no respondía)` : 'Ninguna',
        botcheck: ''
      })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) throw new Error(json.message || `Web3Forms ${res.status}`);
  }
};
