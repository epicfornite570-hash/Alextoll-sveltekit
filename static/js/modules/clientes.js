/* =========================================================
   Área de clientes (clientes.html)
   ---------------------------------------------------------
   - Inicio de sesión con Firebase: correo y contraseña (con
     verificación del correo), Google, X y Microsoft.
     Microsoft no da el correo por comprobado (Firebase no se fía de él), así que
     la primera vez se pide confirmarlo con un enlace, como con correo y contraseña.
     Las reglas de Firestore no cambian: solo enseñan trabajos a correos comprobados.
   - Cliente: ve los trabajos guardados con SU correo, con la
     etapa, el presupuesto (y lo puede aceptar) y las novedades.
   - Tú (AT.config.adminEmail): panel para crear y actualizar trabajos.
   Quién puede leer o cambiar qué lo deciden las reglas de
   deploy/firebase/firestore.rules, no este archivo.

   Pruebas en local con los emuladores de Firebase:
   http://127.0.0.1:PUERTO/clientes.html?emulador  (ver deploy/AREA-CLIENTES.md)
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.clientes = {
  init() {
    const root = AT.$('[data-cl]'); if (!root) return;
    const S = this;
    S.root = root;
    S.vista('cargando');

    const cfg = AT.config.firebase || {};
    S.emu = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).has('emulador');
    if (!cfg.apiKey && !S.emu) { S.vista('pronto'); return; }

    S.ui();
    /* El SDK de Firebase (solo inicio de sesión) está en js/vendor/firebase/ */
    Promise.all([import('../vendor/firebase/firebase-app.js'), import('../vendor/firebase/firebase-auth.js')])
      .then(([app, fa]) => S.arrancar(app, fa, cfg))
      .catch(err => { console.error('[Alextoll] Firebase', err); S.vista('pronto'); });
  },

  /* Microsoft entra por redirección (su ventana emergente corta el contacto con la web y Firebase
     lo toma por «ventana cerrada»). La redirección necesita las páginas de Firebase en este mismo
     dominio (nginx: location /__/auth/), así que mientras dura se usa authDomain = esta web.
     Google y X siguen con la ventana emergente y el authDomain de Firebase.
     sessionStorage 'alx-ms': 'ir' = recargar y salir hacia Microsoft, 'unir' = recargar y unir Microsoft
     a la cuenta abierta, '1' = volviendo de Microsoft.
     Una cuenta por correo (Firebase → Authentication → Configuración → Vinculación): si el correo de
     Microsoft ya tiene cuenta con X, Google o contraseña, Firebase no las junta solo (cualquiera puede
     poner un correo ajeno en una cuenta de Microsoft). Se guarda 'alx-unir' y, cuando entra con su
     método de siempre (prueba de que la cuenta es suya), se une Microsoft a ella: desde entonces vale
     cualquiera de los dos. */
  redireccion: /(^|\.)alextoll\.store$/.test(location.hostname),
  sesion(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); if (v) sessionStorage.setItem(k, v); else sessionStorage.removeItem(k); }
    catch (e) { return null; }
  },
  ms(v) { return this.sesion('alx-ms', v); },
  unir(v) { return this.sesion('alx-unir', v); },

  arrancar(app, fa, cfg) {
    const S = this;
    const paso = S.redireccion ? S.ms() : null;
    let conf = S.emu ? { apiKey: 'demo', authDomain: '127.0.0.1', projectId: 'demo-alextoll', appId: 'demo' } : cfg;
    if (paso) conf = { ...conf, authDomain: location.host };
    S.fa = fa;
    S.auth = fa.getAuth(app.initializeApp(conf));
    S.auth.languageCode = 'es';
    if (S.emu) fa.connectAuthEmulator(S.auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    S.db = AT.firestore(conf.projectId, () => S.auth.currentUser.getIdToken(), S.emu ? 'http://127.0.0.1:8080' : undefined);
    /* Con authDomain = esta web, Google y X fallan (su ventana solo admite el dominio de Firebase).
       Por eso, al terminar con Microsoft, se guardan los avisos y se recarga en modo normal. */
    const recargar = () => {
      S.ms(null);
      S.sesion('alx-avisos', JSON.stringify(S.avisos || []));
      location.reload();
    };

    if (paso === 'ir' || paso === 'unir') {
      S.ms('1');
      const salir = paso === 'ir' ? fa.signInWithRedirect(S.auth, S.microsoft())
        : S.auth.authStateReady().then(() => fa.linkWithRedirect(S.auth.currentUser, S.microsoft()));
      salir.catch(err => {
        S.unir(null); S.avisos = [];
        S.aviso(paso === 'ir' ? 'form' : 'toast', paso === 'ir' ? S.errorRed(err, 'Microsoft') : S.errorUnir(err));
        recargar();
      });
      return;
    }
    if (paso === '1') {
      /* De vuelta de Microsoft: resultado, avisos y recarga (no se pinta nada en este modo) */
      S.avisos = [];
      const uniendo = !!S.unir();
      fa.getRedirectResult(S.auth)
        .then(r => {
          if (!r) return;
          S.unir(null);
          if (r.operationType === 'link') { S.aviso('toast', 'Listo: desde ahora también puedes entrar con Microsoft.', true); return; }
          return S.trasMicrosoft(r.user);
        })
        .catch(err => {
          if (S.callado(err)) return;
          if (uniendo && S.auth.currentUser) { S.unir(null); S.aviso('toast', S.errorUnir(err)); return; }
          if (err && err.code === 'auth/account-exists-with-different-credential') {
            S.unir('microsoft');
            const correo = err.customData && err.customData.email;
            S.aviso('form', `Ya tienes cuenta${correo ? ' con ' + correo : ''} con otro método (X, Google o correo y contraseña). Entra una vez con ese y uniré Microsoft a tu cuenta: luego podrás usar cualquiera de los dos.`, true);
            return;
          }
          S.aviso('form', S.errorRed(err, 'Microsoft'));
        })
        .finally(recargar);
      return;
    }

    fa.onAuthStateChanged(S.auth, (u) => S.pintar(u));
    /* Avisos guardados antes de recargar */
    let guardados = [];
    try { guardados = JSON.parse(S.sesion('alx-avisos') || '[]'); } catch (e) {}
    S.sesion('alx-avisos', null);
    guardados.forEach(a => S.aviso(a.donde, a.txt, a.ok));
  },
  /* Aviso en el formulario de acceso ('form'), en «Revisa tu correo» ('ver') o flotante ('toast').
     Mientras se vuelve de Microsoft se guardan (S.avisos) para enseñarlos tras recargar. */
  aviso(donde, txt, ok) {
    if (this.avisos) { this.avisos.push({ donde, txt, ok: !!ok }); return; }
    if (donde === 'toast') { setTimeout(() => AT.toast(txt), 300); return; }
    this.estado(AT.$(donde === 'ver' ? '[data-estado-ver]' : '#cl-form [data-estado]'), txt, ok);
  },
  errorUnir(err) {
    console.error('[Alextoll] unir Microsoft', err);
    const c = err && err.code || '';
    if (c === 'auth/provider-already-linked') return 'Tu cuenta ya tenía Microsoft.';
    if (c === 'auth/credential-already-in-use') return 'Esa cuenta de Microsoft ya es otra cuenta de la web. Escríbeme y las uno.';
    return 'No he podido unir Microsoft a tu cuenta' + (c ? ` (${c})` : '') + '. Puedes seguir entrando como hasta ahora.';
  },

  microsoft() {
    const p = new this.fa.OAuthProvider('microsoft.com');
    p.setCustomParameters({ prompt: 'select_account' });
    return p;
  },
  /* Microsoft: la primera vez, enlace para confirmar el correo (la vista «Revisa tu correo» sale sola) */
  async trasMicrosoft(user) {
    const S = this, fa = S.fa;
    if (user.emailVerified) return;
    if (!S.correo(user)) { await fa.signOut(S.auth); S.aviso('form', 'Tu cuenta de Microsoft no tiene correo. Entra con otro método.'); }
    else await S.pedirConfirmacion(user).then(() => S.aviso('ver', `Enlace enviado a ${S.correo(user)}.`, true)).catch(err => S.falloEnvio(err));
  },
  /* Si Firebase no manda el correo, que se vea en «Revisa tu correo» (si no, el cliente espera un correo que nunca llega) */
  falloEnvio(err) {
    console.error('[Alextoll] confirmar correo', err);
    const c = err && err.code || '';
    this.aviso('ver', c === 'auth/too-many-requests' ? this.error(err)
      : `No he podido enviarte el correo (${c || 'error'}${err && err.message ? ' · ' + String(err.message).replace(/^Firebase:\s*/, '').slice(0, 160) : ''}). Pulsa «Reenviar» o entra con Google.`);
  },
  /* Con «varias cuentas por proveedor» (Firebase → Authentication → Configuración), Microsoft deja
     vacío user.email y el correo solo viene en providerData */
  correo(u) { return u.email || (u.providerData.find(p => p.email) || {}).email || ''; },
  /* Sin correo principal: verifyBeforeUpdateEmail lo pone (ya confirmado) cuando abre el enlace */
  pedirConfirmacion(u) { return u.email ? this.fa.sendEmailVerification(u) : this.fa.verifyBeforeUpdateEmail(u, this.correo(u)); },

  /* ---------- Vistas ---------- */
  vista(nombre, foco) {
    AT.$$('[data-vista]', this.root).forEach(v => { v.hidden = v.dataset.vista !== nombre; });
    AT.$('[data-barra]', this.root).hidden = !(nombre === 'cliente' || nombre === 'admin');
    if (foco) AT.$(`[data-vista="${nombre}"] h1`, this.root)?.focus({ preventScroll: true });
  },

  proveedor(u) { return (u.providerData[0] || {}).providerId || 'password'; },
  esAdmin(u) {
    const admin = (AT.config.adminEmail || '').toLowerCase();
    return !!u.email && u.email.toLowerCase() === admin && u.emailVerified;
  },

  async pintar(u) {
    const S = this, antes = S.user;
    S.user = u;
    if (!u) { S.vista('acceso', !!antes); return; }
    /* Confirmar el correo solo si todos sus métodos son de los que no lo garantizan (contraseña, Microsoft) */
    const metodos = u.providerData.map(p => p.providerId);
    const sinGarantia = !metodos.length || metodos.every(id => ['password', 'microsoft.com'].includes(id));
    if ((sinGarantia && !u.emailVerified) || (!u.email && S.correo(u))) {
      AT.$$('[data-cl-email]', S.root).forEach(e => { e.textContent = S.correo(u); });
      S.vista('verificar', true);
      return;
    }
    /* Venía de «ya tienes cuenta con otro método»: ahora que ha entrado con el suyo, se une Microsoft */
    if (S.unir() === 'microsoft') {
      if (metodos.includes('microsoft.com') || !S.redireccion) S.unir(null);
      else { S.ms('unir'); if (S.ms() === 'unir') { S.vista('cargando'); location.reload(); return; } S.unir(null); }
    }
    const nombre = u.displayName || (u.email || 'cliente').split('@')[0];
    /* Con qué ha entrado esta vez (una cuenta puede tener varios métodos) */
    const metodo = await u.getIdTokenResult().then(r => r.signInProvider).catch(() => S.proveedor(u));
    if (S.user !== u) return;
    const via = { 'google.com': 'Google', 'twitter.com': 'X', 'microsoft.com': 'Microsoft', 'facebook.com': 'Facebook', password: 'correo' }[metodo] || '';
    AT.$('[data-cl-nombre]', S.root).textContent = nombre;
    AT.$$('[data-cl-email]', S.root).forEach(e => { e.textContent = u.email || 'Sin correo'; });
    AT.$('[data-cl-via]', S.root).textContent = via ? ' · con ' + via : '';
    AT.$('[data-cl-iniciales]', S.root).textContent = nombre.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    AT.$('[data-cl-saludo]', S.root).textContent = nombre.split(' ')[0];

    if (S.esAdmin(u)) { S.vista('admin', true); S.panel.cargar(); }
    else { S.vista('cliente', true); S.cliente.cargar(); }
  },

  /* ---------- Mensajes de error de Firebase, en cristiano ---------- */
  error(err) {
    const c = err && err.code || '';
    const M = {
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/wrong-password': 'Correo o contraseña incorrectos.',
      'auth/user-not-found': 'Correo o contraseña incorrectos.',
      'auth/invalid-email': 'Ese correo no parece válido.',
      'auth/missing-password': 'Escribe tu contraseña.',
      'auth/email-already-in-use': 'Ya hay una cuenta con ese correo. Pulsa «Entrar».',
      'auth/weak-password': 'La contraseña es demasiado corta (mínimo 8 caracteres).',
      'auth/password-does-not-meet-requirements': 'La contraseña es demasiado sencilla. Prueba con una más larga.',
      'auth/popup-blocked': 'Tu navegador ha bloqueado la ventana de acceso. Permite las ventanas emergentes en esta web y vuelve a probar.',
      'auth/account-exists-with-different-credential': 'Ya tienes cuenta con ese correo usando otro método. Entra con ese (Google, X, Microsoft o correo).',
      'auth/operation-not-allowed': 'Este método de acceso todavía no está activado.',
      'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos y vuelve a probar.',
      'auth/network-request-failed': 'No hay conexión. Revisa tu internet y vuelve a probar.',
      'auth/unauthorized-domain': 'Esta web todavía no está autorizada en Firebase.',
      'auth/requires-recent-login': 'Por seguridad, cierra sesión, vuelve a entrar y repítelo.',
      'auth/user-disabled': 'Esta cuenta está desactivada.'
    };
    if (M[c]) return M[c];
    if (err && err.status === 403) return 'No tienes permiso para ver esto.';
    return 'No se ha podido completar. Inténtalo de nuevo.';
  },
  /* Google, X y Microsoft: «Correo o contraseña incorrectos» no tiene sentido aquí, y el detalle
     del servidor (p. ej. AADSTS7000215 = secreto de la app de Microsoft mal puesto en Firebase) ayuda a arreglarlo */
  errorRed(err, via) {
    console.error('[Alextoll] acceso con ' + via, err);
    const c = err && err.code || '';
    if (!['auth/invalid-credential', 'auth/internal-error', ''].includes(c) && !/auth\/(wrong-password|user-not-found)/.test(c)) return this.error(err);
    const detalle = String(err && err.message || '').replace(/^Firebase:\s*/, '').replace(/\s*\(auth\/[^)]+\)\.?$/, '');
    return `${via} no ha aceptado el acceso. Prueba otra vez o entra con otro método.` + (detalle && !/^Error$/.test(detalle) ? ` (${c} · ${detalle.slice(0, 200)})` : c ? ` (${c})` : '');
  },
  callado(err) { return ['auth/popup-closed-by-user', 'auth/cancelled-popup-request', 'auth/user-cancelled'].includes(err && err.code); },

  estado(box, txt, ok) {
    if (!box) return;
    box.hidden = !txt;
    box.className = 'status ' + (ok ? 'ok' : 'bad');
    box.textContent = txt || '';
  },

  /* Ventana de confirmación bonita (en lugar de confirm()) */
  confirmar(titulo, texto, boton) {
    const d = AT.$('#cl-confirmar');
    AT.$('#cl-cf-t', d).textContent = titulo;
    AT.$('[data-texto]', d).textContent = texto;
    AT.$('[data-si]', d).textContent = boton;
    d.returnValue = '';
    d.showModal();
    return new Promise(r => d.addEventListener('close', () => r(d.returnValue === 'si'), { once: true }));
  },

  /* ---------- Formulario de acceso y botones ---------- */
  ui() {
    const S = this, form = AT.$('#cl-form'), box = AT.$('[data-estado]', form);
    let modo = 'entrar';

    const cambiarModo = (m) => {
      modo = m;
      AT.$$('.cl-tabs [role="tab"]').forEach(t => {
        const on = t.dataset.modo === m;
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        if (on) form.setAttribute('aria-labelledby', t.id);
      });
      AT.$$('[data-solo]', form).forEach(el => { el.hidden = el.dataset.solo !== m; });
      AT.$('#cl-pass').autocomplete = m === 'crear' ? 'new-password' : 'current-password';
      AT.$('[data-enviar]', form).firstChild.textContent = m === 'crear' ? 'Crear cuenta' : 'Entrar';
      S.estado(box, '');
    };
    AT.$$('.cl-tabs [role="tab"]').forEach(t => {
      t.addEventListener('click', () => cambiarModo(t.dataset.modo));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const otro = AT.$(`.cl-tabs [data-modo="${t.dataset.modo === 'entrar' ? 'crear' : 'entrar'}"]`);
        otro.focus(); cambiarModo(otro.dataset.modo);
      });
    });

    /* Ver u ocultar la contraseña */
    const ojo = AT.$('[data-ver-pass]');
    ojo.addEventListener('click', () => {
      const pass = AT.$('#cl-pass'), ver = pass.type === 'password';
      pass.type = ver ? 'text' : 'password';
      ojo.setAttribute('aria-pressed', String(ver));
      ojo.setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });

    /* Correo y contraseña */
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!S.auth) return;
      const email = AT.$('#cl-email').value.trim(), pass = AT.$('#cl-pass').value, nombre = AT.$('#cl-nombre').value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) return S.estado(box, 'Escribe un correo válido.');
      if (modo === 'crear' && pass.length < 8) return S.estado(box, 'La contraseña necesita al menos 8 caracteres.');
      if (!pass) return S.estado(box, 'Escribe tu contraseña.');
      const btn = AT.$('[data-enviar]', form); btn.disabled = true; S.estado(box, '');
      try {
        if (modo === 'crear') {
          const { user } = await S.fa.createUserWithEmailAndPassword(S.auth, email, pass);
          if (nombre) await S.fa.updateProfile(user, { displayName: nombre });
          await S.fa.sendEmailVerification(user);
          S.pintar(S.auth.currentUser);
        } else {
          await S.fa.signInWithEmailAndPassword(S.auth, email, pass);
        }
        form.reset();
      } catch (err) { S.estado(box, S.error(err)); }
      finally { btn.disabled = false; }
    });

    /* He olvidado mi contraseña */
    AT.$('[data-olvido]').addEventListener('click', async () => {
      const email = AT.$('#cl-email').value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { AT.$('#cl-email').focus(); return S.estado(box, 'Escribe arriba tu correo y vuelve a pulsar.'); }
      try {
        await S.fa.sendPasswordResetEmail(S.auth, email);
        S.estado(box, `Si hay una cuenta con ${email}, te llegará un correo para cambiar la contraseña.`, true);
      } catch (err) { S.estado(box, S.error(err)); }
    });

    /* Google, X y Microsoft (ventana emergente) */
    AT.$$('[data-proveedor]').forEach(b => b.addEventListener('click', async () => {
      if (!S.auth) return;
      const fa = S.fa, id = b.dataset.proveedor;
      /* Microsoft en la web publicada: recargar con authDomain = esta web y salir hacia Microsoft (ver arrancar) */
      if (id === 'microsoft' && S.redireccion) {
        S.ms('ir');
        if (S.ms() === 'ir') { S.vista('cargando'); location.reload(); return; }   /* sin sessionStorage: ventana emergente */
      }
      let p;
      if (id === 'google') { p = new fa.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); }
      else if (id === 'facebook') { p = new fa.FacebookAuthProvider(); p.addScope('email'); }
      else if (id === 'microsoft') p = S.microsoft();
      else p = new fa.TwitterAuthProvider();
      S.estado(box, '');
      b.disabled = true;
      try {
        const { user } = await fa.signInWithPopup(S.auth, p);
        if (id === 'microsoft') await S.trasMicrosoft(user);
        else if (!user.email && S.correo(user)) await S.pedirConfirmacion(user).catch(err => S.falloEnvio(err));
      }
      catch (err) { if (!S.callado(err)) S.estado(box, S.errorRed(err, b.textContent.replace(/^\s*Continuar con\s*/, '').trim() || 'El proveedor')); }
      finally { b.disabled = false; }
    }));

    /* Verificación del correo */
    const boxVer = AT.$('[data-estado-ver]');
    AT.$('[data-ya-verificado]').addEventListener('click', async () => {
      const u = S.auth.currentUser; if (!u) return;
      try { await u.reload(); }
      catch (err) {
        /* Al poner el correo con el enlace, Firebase puede cerrar la sesión: se vuelve a entrar y ya está confirmado */
        if (/user-token-expired|user-not-found|invalid-user-token/.test(err && err.code)) {
          await S.fa.signOut(S.auth);
          return S.estado(AT.$('#cl-form [data-estado]'), 'Correo confirmado. Vuelve a entrar con el mismo método.', true);
        }
        return S.estado(boxVer, S.error(err));
      }
      if (u.emailVerified) { await u.getIdToken(true); S.pintar(S.auth.currentUser); }
      else S.estado(boxVer, 'Todavía no aparece como confirmado. Abre el enlace del correo y vuelve a pulsar.');
    });
    AT.$('[data-reenviar]').addEventListener('click', async () => {
      const u = S.auth.currentUser; if (!u) return;
      try { await S.pedirConfirmacion(u); S.estado(boxVer, 'Te lo he vuelto a enviar.', true); }
      catch (err) {
        /* Poner el correo (verifyBeforeUpdateEmail) exige haber entrado hace poco: se vuelve a entrar y se envía al volver */
        if (err && err.code === 'auth/requires-recent-login') {
          if (S.proveedor(u) === 'microsoft.com' && S.redireccion) { S.ms('ir'); if (S.ms() === 'ir') { S.vista('cargando'); location.reload(); return; } }
          await S.fa.signOut(S.auth);
          return S.estado(AT.$('#cl-form [data-estado]'), 'Vuelve a entrar y te envío el correo al momento.', true);
        }
        S.falloEnvio(err);
      }
    });

    /* Cerrar sesión y borrar la cuenta */
    AT.$$('[data-salir]').forEach(b => b.addEventListener('click', () => S.fa.signOut(S.auth)));
    AT.$('[data-borrar-cuenta]').addEventListener('click', async () => {
      const ok = await S.confirmar('¿Eliminar tu cuenta?', 'Se borra tu acceso. Los trabajos que hemos hecho se quedan guardados para la garantía; si quieres que también los borre, escríbeme.', 'Eliminar cuenta');
      if (!ok) return;
      try { await S.fa.deleteUser(S.auth.currentUser); AT.toast('Cuenta eliminada'); }
      catch (err) { AT.toast(S.error(err)); }
    });

    S.panel.ui(S);
  },

  /* ---------- Utilidades de los trabajos ---------- */
  tipo(t) { return AT.TIPOS_TRABAJO[t.tipo] || AT.TIPOS_TRABAJO.ordenador; },
  etapa(t) {
    const etapas = this.tipo(t).etapas;
    const i = Math.max(0, etapas.findIndex(e => e.id === t.estado));
    return { i, e: etapas[i], n: etapas.length, final: i === etapas.length - 1 };
  },
  euros(n) { return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: n % 1 ? 2 : 0 }).format(n || 0); },
  fecha(iso, larga) {
    if (!iso) return '';
    const d = new Date(iso.length === 10 ? iso + 'T12:00:00' : iso);
    return isNaN(d) ? '' : d.toLocaleDateString('es-ES', larga ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short' });
  },
  total(t) { return (t.presupuesto || []).reduce((s, l) => s + (Number(l.precio) || 0), 0); },
  ref(t) { return t.id.slice(0, 6).toUpperCase(); },
  ordenar(lista) { return lista.sort((a, b) => String(b.actualizado || '').localeCompare(String(a.actualizado || ''))); },

  /* Tarjeta de un trabajo, como la ve el cliente */
  tarjeta(t) {
    const S = this, esc = AT.esc, tipo = S.tipo(t), { i, e, n, final } = S.etapa(t);
    const lineas = t.presupuesto || [], novedades = (t.novedades || []).slice().reverse();
    const pasos = tipo.etapas.map((x, k) =>
      `<li class="${k < i || final ? 'is-done' : ''}${k === i ? ' is-now' : ''}"${k === i ? ' aria-current="step"' : ''}><span class="cl-dot" aria-hidden="true">${k < i || final ? AT.lsvg('lCheck') : ''}</span><span class="cl-step-n">${esc(x.nombre)}</span></li>`).join('');
    const presupuesto = lineas.length ? `
        <section class="cl-block cl-quote" aria-label="Presupuesto">
          <h4>Presupuesto</h4>
          <table>
            <tbody>${lineas.map(l => `<tr><td>${esc(l.concepto)}</td><td>${S.euros(Number(l.precio))}</td></tr>`).join('')}</tbody>
            <tfoot><tr><th scope="row">Total</th><td>${S.euros(S.total(t))}</td></tr></tfoot>
          </table>
          ${t.presupuestoAceptado
            ? `<p class="cl-ok">${AT.lsvg('lCheck')}Aceptado${t.presupuestoAceptadoEn ? ' el ' + S.fecha(t.presupuestoAceptadoEn, true) : ''}</p>`
            : final ? '' : `<button class="btn btn--primary btn--sm" type="button" data-aceptar="${esc(t.id)}">Aceptar presupuesto</button>
          <p class="cl-small">Al aceptarlo me pongo con ello. Si tienes dudas, escríbeme antes.</p>`}
        </section>` : '';
    const historial = novedades.length ? `
        <section class="cl-block" aria-label="Novedades">
          <h4>Novedades</h4>
          <ol class="cl-news">${novedades.map(x => `<li><time datetime="${esc(x.fecha)}">${S.fecha(x.fecha)}</time><p>${esc(x.texto)}</p></li>`).join('')}</ol>
        </section>` : '';
    return `
      <article class="card cl-job${final ? ' is-final' : ''}" data-p="${n > 1 ? i / (n - 1) : 1}">
        <header class="cl-job-head">
          <span class="cl-job-ico">${AT.lsvg(tipo.icono)}</span>
          <div class="cl-job-tt">
            <p class="cl-job-kind">${esc(tipo.nombre)} · Ref. ${S.ref(t)}</p>
            <h3>${esc(t.titulo)}</h3>
            ${t.servicio ? `<p class="cl-job-srv">${esc(t.servicio)}</p>` : ''}
          </div>
          <span class="cl-pill${final ? ' is-final' : ''}">${esc(e.nombre)}</span>
        </header>
        <ol class="cl-steps" aria-label="Progreso: etapa ${i + 1} de ${n}">${pasos}</ol>
        <p class="cl-now">${esc(e.texto)}${t.fechaPrevista && !final ? ` <span>Fecha prevista: <b>${S.fecha(t.fechaPrevista, true)}</b></span>` : ''}</p>
        ${presupuesto || historial ? `<div class="cl-job-grid">${presupuesto}${historial}</div>` : ''}
        <footer class="cl-job-foot">
          <span>Actualizado ${S.fecha(t.actualizado, true)}</span>
          <a class="btn btn--link" href="${esc(AT.mailLink('Trabajo ' + S.ref(t) + ': ' + t.titulo))}">¿Dudas? Escríbeme${AT.lsvg('lArrow', 'ico-arrow')}</a>
        </footer>
      </article>`;
  },

  /* ---------- Vista del cliente ---------- */
  cliente: {
    async cargar() {
      const S = AT.modules.clientes, caja = AT.$('#cl-trabajos'), u = S.user;
      if (!u.email) {
        caja.innerHTML = S.vacio('Tu cuenta no comparte el correo', 'Para ver tus trabajos necesito saber tu correo. Entra con Google, Microsoft o con tu correo y contraseña.');
        return;
      }
      caja.innerHTML = '<div class="cl-loading"><span class="cl-spin" aria-hidden="true"></span><span>Cargando tus trabajos…</span></div>';
      try {
        const lista = S.ordenar(await S.db.query('trabajos', { campo: 'email', igual: u.email.toLowerCase() }));
        S.lista = lista;
        caja.innerHTML = lista.length ? lista.map(t => S.tarjeta(t)).join('')
          : S.vacio('Todavía no hay trabajos a tu nombre', `Cuando me dejes un equipo o me encargues una web, lo verás aquí. Dame este mismo correo: <b>${AT.esc(u.email)}</b>.`, true);
        /* Barra de progreso de cada trabajo (no va como style= por la Content-Security-Policy) */
        AT.$$('.cl-job[data-p]', caja).forEach(el => el.style.setProperty('--p', el.dataset.p));
      } catch (err) {
        console.error(err);
        caja.innerHTML = S.vacio('No he podido cargar tus trabajos', AT.esc(S.error(err)) + ' Recarga la página en un momento.');
      }
      AT.$$('[data-aceptar]', caja).forEach(b => b.addEventListener('click', () => this.aceptar(b.dataset.aceptar, b)));
    },
    async aceptar(id, b) {
      const S = AT.modules.clientes, t = S.lista.find(x => x.id === id);
      const ok = await S.confirmar('¿Aceptas el presupuesto?', `${t.titulo}: ${S.euros(S.total(t))}. En cuanto lo aceptes me pongo con ello.`, 'Aceptar presupuesto');
      if (!ok) return;
      b.disabled = true;
      try {
        await S.db.cambiar('trabajos', id, { presupuestoAceptado: true, presupuestoAceptadoEn: new Date().toISOString() });
        AT.toast('Presupuesto aceptado. ¡Gracias!');
        this.cargar();
      } catch (err) { b.disabled = false; AT.toast(S.error(err)); }
    }
  },

  vacio(titulo, texto, ctas) {
    return `<div class="card cl-empty">
      <span class="cl-note-ico">${AT.lsvg('lLaptop')}</span>
      <h3>${AT.esc(titulo)}</h3><p>${texto}</p>
      ${ctas ? `<div class="cl-note-acts"><a class="btn btn--primary btn--sm" href="ordenadores.html#contacto">Pedir presupuesto</a><a class="btn btn--secondary btn--sm" href="webs.html#idea">Quiero una web</a></div>` : ''}
    </div>`;
  },

  /* ---------- Tu panel ---------- */
  panel: {
    filtro: 'curso', lista: [], editando: null,

    ui(S) {
      const P = this, dlg = AT.$('#cl-editor'), form = AT.$('form', dlg);
      AT.$('[data-nuevo]').addEventListener('click', () => P.abrir(null));
      AT.$$('[data-filtro]').forEach(b => b.addEventListener('click', () => {
        P.filtro = b.dataset.filtro;
        AT.$$('[data-filtro]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        P.pintar();
      }));
      AT.$('#cl-buscar').addEventListener('input', () => P.pintar());

      /* Tipo → etapas del desplegable */
      const tipo = AT.$('#ed-tipo');
      tipo.innerHTML = Object.entries(AT.TIPOS_TRABAJO).map(([k, v]) => `<option value="${k}">${AT.esc(v.nombre)}</option>`).join('');
      tipo.addEventListener('change', () => P.etapas(tipo.value));

      AT.$('[data-linea]', dlg).addEventListener('click', () => { P.linea(); AT.$('#ed-lineas .cl-line:last-child input').focus(); });
      AT.$('#ed-lineas').addEventListener('input', () => P.sumar());
      AT.$('#ed-lineas').addEventListener('click', e => {
        const x = e.target.closest('[data-quitar]'); if (x) { x.closest('.cl-line').remove(); P.sumar(); }
      });
      AT.$('#ed-novedades').addEventListener('click', e => {
        const x = e.target.closest('[data-quitar-nov]'); if (x) x.closest('li').remove();
      });
      AT.$$('[data-cerrar]', dlg).forEach(b => b.addEventListener('click', () => dlg.close()));
      dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
      form.addEventListener('submit', e => { e.preventDefault(); P.guardar(); });
      AT.$('[data-borrar]', dlg).addEventListener('click', () => P.borrar());
    },

    async cargar() {
      const S = AT.modules.clientes, caja = AT.$('#cl-admin-lista');
      caja.innerHTML = '<div class="cl-loading"><span class="cl-spin" aria-hidden="true"></span><span>Cargando…</span></div>';
      try { this.lista = S.ordenar(await S.db.query('trabajos')); this.pintar(); }
      catch (err) { console.error(err); caja.innerHTML = S.vacio('No se han podido cargar los trabajos', AT.esc(S.error(err)) + ' ¿Has publicado las reglas de Firestore? (deploy/AREA-CLIENTES.md)'); }
    },

    pintar() {
      const S = AT.modules.clientes, P = this, esc = AT.esc;
      const enCurso = P.lista.filter(t => !S.etapa(t).final);
      const pendientes = enCurso.filter(t => (t.presupuesto || []).length && !t.presupuestoAceptado);
      AT.$('#cl-tiles').innerHTML = [
        ['En curso', enCurso.length], ['Presupuesto sin aceptar', pendientes.length], ['Terminados', P.lista.length - enCurso.length]
      ].map(([k, v]) => `<div class="cl-tile"><span>${k}</span><b>${v}</b></div>`).join('');

      const q = AT.$('#cl-buscar').value.trim().toLowerCase();
      const ver = P.lista.filter(t => (P.filtro === 'todos' || (P.filtro === 'curso') === !S.etapa(t).final)
        && (!q || [t.cliente, t.email, t.titulo, t.servicio, S.ref(t)].join(' ').toLowerCase().includes(q)));
      const caja = AT.$('#cl-admin-lista');
      caja.innerHTML = ver.length ? ver.map(t => {
        const { e, final } = S.etapa(t), tipo = S.tipo(t);
        const aviso = (t.presupuesto || []).length && !final ? (t.presupuestoAceptado ? 'Presupuesto aceptado' : 'Presupuesto pendiente') : '';
        return `<button class="card cl-row" type="button" data-editar="${esc(t.id)}">
          <span class="cl-job-ico">${AT.lsvg(tipo.icono)}</span>
          <span class="cl-row-main"><b>${esc(t.titulo)}</b><span>${esc(t.cliente || '')}${t.cliente ? ' · ' : ''}${esc(t.email)}</span></span>
          <span class="cl-row-meta">${aviso ? `<small class="${t.presupuestoAceptado ? 'is-ok' : ''}">${aviso}</small>` : ''}<span class="cl-pill${final ? ' is-final' : ''}">${esc(e.nombre)}</span></span>
          <span class="cl-row-date">${S.fecha(t.actualizado)}</span>
        </button>`;
      }).join('') : `<p class="cl-none">${P.lista.length ? 'No hay trabajos con este filtro.' : 'Todavía no hay trabajos. Crea el primero con «Nuevo trabajo».'}</p>`;
      AT.$$('[data-editar]', caja).forEach(b => b.addEventListener('click', () => P.abrir(P.lista.find(t => t.id === b.dataset.editar))));
    },

    etapas(tipo, actual) {
      AT.$('#ed-estado').innerHTML = (AT.TIPOS_TRABAJO[tipo] || AT.TIPOS_TRABAJO.ordenador).etapas
        .map(x => `<option value="${x.id}"${x.id === actual ? ' selected' : ''}>${AT.esc(x.nombre)}</option>`).join('');
    },
    linea(l = {}) {
      AT.$('#ed-lineas').insertAdjacentHTML('beforeend', `<div class="cl-line">
        <input type="text" aria-label="Concepto" placeholder="Concepto (p. ej. SSD 1 TB)" maxlength="120" value="${AT.esc(l.concepto || '')}">
        <input type="number" aria-label="Precio en euros" placeholder="€" min="0" step="0.01" inputmode="decimal" value="${l.precio ?? ''}">
        <button class="cl-x" type="button" data-quitar aria-label="Quitar línea">${AT.lsvg('lPlus')}</button>
      </div>`);
    },
    sumar() {
      const S = AT.modules.clientes;
      AT.$('#ed-total').textContent = S.euros(this.lineas().reduce((s, l) => s + l.precio, 0));
    },
    lineas() {
      return AT.$$('#ed-lineas .cl-line').map(r => {
        const [c, p] = AT.$$('input', r);
        return { concepto: c.value.trim(), precio: Math.round((parseFloat(String(p.value).replace(',', '.')) || 0) * 100) / 100 };
      }).filter(l => l.concepto || l.precio);
    },

    abrir(t) {
      const S = AT.modules.clientes, P = this, dlg = AT.$('#cl-editor');
      P.editando = t;
      AT.$('#cl-ed-t').textContent = t ? `${t.titulo} · Ref. ${S.ref(t)}` : 'Nuevo trabajo';
      AT.$('#ed-email').value = t?.email || '';
      AT.$('#ed-cliente').value = t?.cliente || '';
      AT.$('#ed-tipo').value = t?.tipo || 'ordenador';
      P.etapas(AT.$('#ed-tipo').value, t?.estado);
      AT.$('#ed-titulo').value = t?.titulo || '';
      AT.$('#ed-servicio').value = t?.servicio || '';
      AT.$('#ed-fecha').value = t?.fechaPrevista || '';
      AT.$('#ed-lineas').innerHTML = '';
      (t?.presupuesto || []).forEach(l => P.linea(l));
      if (!t?.presupuesto?.length) P.linea();
      P.sumar();
      AT.$('#ed-aceptado').checked = !!t?.presupuestoAceptado;
      AT.$('#ed-novedades').innerHTML = (t?.novedades || []).map((x, k) =>
        `<li data-k="${k}"><time>${S.fecha(x.fecha)}</time><p>${AT.esc(x.texto)}</p><button class="cl-x" type="button" data-quitar-nov aria-label="Quitar esta novedad">${AT.lsvg('lPlus')}</button></li>`).join('');
      AT.$('#ed-nota').value = '';
      AT.$('[data-borrar]', dlg).hidden = !t;
      S.estado(AT.$('[data-estado-ed]'), '');
      dlg.showModal();
      AT.$(t ? '#ed-estado' : '#ed-email').focus();
    },

    async guardar() {
      const S = AT.modules.clientes, P = this, t = P.editando, box = AT.$('[data-estado-ed]');
      const email = AT.$('#ed-email').value.trim().toLowerCase(), titulo = AT.$('#ed-titulo').value.trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { AT.$('#ed-email').focus(); return S.estado(box, 'Falta el correo del cliente (es con el que entrará).'); }
      if (!titulo) { AT.$('#ed-titulo').focus(); return S.estado(box, 'Ponle un título al trabajo.'); }

      const ahora = new Date().toISOString(), tipo = AT.$('#ed-tipo').value, estado = AT.$('#ed-estado').value;
      const previas = t?.novedades || [];
      const novedades = AT.$$('#ed-novedades li').map(li => previas[+li.dataset.k]).filter(Boolean);
      if (!t || t.estado !== estado) {
        const e = (AT.TIPOS_TRABAJO[tipo] || AT.TIPOS_TRABAJO.ordenador).etapas.find(x => x.id === estado);
        novedades.push({ fecha: ahora, texto: t ? `Nueva etapa: ${e.nombre}.` : `Trabajo abierto. Etapa: ${e.nombre}.` });
      }
      const nota = AT.$('#ed-nota').value.trim();
      if (nota) novedades.push({ fecha: ahora, texto: nota });

      const aceptado = AT.$('#ed-aceptado').checked;
      const datos = {
        email, cliente: AT.$('#ed-cliente').value.trim(), tipo, estado, titulo,
        servicio: AT.$('#ed-servicio').value.trim(), fechaPrevista: AT.$('#ed-fecha').value,
        presupuesto: P.lineas(), presupuestoAceptado: aceptado,
        presupuestoAceptadoEn: aceptado ? (t?.presupuestoAceptadoEn || ahora) : '',
        novedades, actualizado: ahora
      };
      const btn = AT.$('[data-guardar]'); btn.disabled = true;
      try {
        if (t) await S.db.cambiar('trabajos', t.id, datos);
        else await S.db.crear('trabajos', { ...datos, creado: ahora });
        AT.$('#cl-editor').close();
        AT.toast(t ? 'Trabajo actualizado' : 'Trabajo creado');
        P.cargar();
      } catch (err) { console.error(err); S.estado(box, S.error(err)); }
      finally { btn.disabled = false; }
    },

    async borrar() {
      const S = AT.modules.clientes, P = this, t = P.editando;
      const ok = await S.confirmar('¿Borrar este trabajo?', `«${t.titulo}» de ${t.email}. El cliente dejará de verlo. No se puede deshacer.`, 'Borrar');
      if (!ok) return;
      try { await S.db.borrar('trabajos', t.id); AT.$('#cl-editor').close(); AT.toast('Trabajo borrado'); P.cargar(); }
      catch (err) { S.estado(AT.$('[data-estado-ed]'), S.error(err)); }
    }
  }
};
