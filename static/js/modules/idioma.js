/* =========================================================
   Botón ES/EN: cambia el idioma SIN salir de la página
   ---------------------------------------------------------
   Las dos versiones siguen existiendo como páginas propias
   (index.html ↔ en/index.html…) para que Google indexe cada idioma.
   Al pulsar el botón (.nav-lang o .foot-lang):
   1. Se descarga la otra versión (ya empezó a bajarse al acercar el ratón).
   2. Se cambia el contenido de la página por el del otro idioma, con un
      fundido suave. La dirección de la barra NO cambia (lo pidió Alextoll):
      un <base href> apunta a la otra versión para que sus enlaces e imágenes
      relativos sigan funcionando, y los enlaces #seccion se resuelven aquí.
   3. Se vuelven a cargar los datos (js/data/) y a arrancar los módulos.
   Te deja en la misma sección, el vídeo de la cabecera sigue sin cortarse
   y lo que hayas escrito en el formulario se mantiene.

   Si algo no cuadra (la página no tiene pareja en el otro idioma, usa otros
   estilos, se abre en local con file:// o falla la descarga) se navega
   de la forma normal, así que el botón siempre funciona.
   ========================================================= */
window.AT = window.AT || {};

(function () {
  const BOTON = 'a.nav-lang, a.foot-lang';
  const descargas = new Map();                    // url → Promise<texto HTML>
  const cargados = new Set([...document.scripts].map(s => s.src).filter(Boolean));
  let actual = location.href, ocupado = false;   // de qué página es el contenido que se ve (puede no ser el de la barra)

  if (!window.fetch || !window.DOMParser || location.protocol === 'file:') return;

  /* /en/index.html y /en/ son la misma página */
  const ruta = (u) => new URL(u, location.href).pathname.replace(/index\.html$/, '');

  /* <base> = la página de la que viene el contenido (sin él, "computers.html" se buscaría junto a la de la barra) */
  const base = (url) => {
    let b = document.getElementById('at-base');
    if (ruta(url) === ruta(location.href)) { b?.remove(); return; }
    if (!b) { b = document.createElement('base'); b.id = 'at-base'; document.head.prepend(b); }
    b.href = url;
  };

  /* Con <base>, un enlace "#contacto" llevaría a la otra página: se desplaza aquí mismo */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !document.getElementById('at-base') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const h = a.getAttribute('href'), destino = h.length > 1 && document.getElementById(decodeURIComponent(h.slice(1)));
    if (h.length > 1 && !destino) return;
    history.pushState(history.state, '', location.href.split('#')[0] + (h.length > 1 ? h : ''));
    destino ? destino.scrollIntoView({ behavior: AT.reduceMotion ? 'auto' : 'smooth' }) : scrollTo({ top: 0, behavior: AT.reduceMotion ? 'auto' : 'smooth' });
  }, true);

  const descargar = (url) => {
    if (!descargas.has(url)) {
      descargas.set(url, fetch(url, { credentials: 'same-origin' })
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
        .catch(err => { descargas.delete(url); throw err; }));
    }
    return descargas.get(url);
  };

  /* Ejecuta scripts en orden (los que ya estaban se sirven de la caché) */
  const scripts = (lista) => new Promise((ok, mal) => {
    if (!lista.length) return ok();
    let pendientes = lista.length;
    lista.forEach(src => {
      const s = document.createElement('script');
      s.src = src; s.async = false;
      s.onload = () => { cargados.add(src); if (--pendientes === 0) ok(); };
      s.onerror = () => mal(new Error('No carga ' + src));
      document.body.appendChild(s);
    });
  });

  /* Dónde estás: la sección con id que ocupa lo alto de la pantalla y cuánto has bajado dentro */
  const posicion = () => {
    const linea = 90;
    let mejor = null;
    document.querySelectorAll('body [id]').forEach(el => {
      if (!/^(SECTION|HEADER|FOOTER|MAIN|ARTICLE)$/.test(el.tagName)) return;
      const r = el.getBoundingClientRect();
      if (r.height && r.top <= linea && r.bottom > linea && (!mejor || r.height <= mejor.alto)) {
        mejor = { id: el.id, parte: (linea - r.top) / r.height, alto: r.height };
      }
    });
    const max = document.documentElement.scrollHeight - innerHeight;
    return { ...mejor, y: scrollY, ratio: max > 0 ? scrollY / max : 0 };
  };
  const volver = (p) => {
    const el = p.id && document.getElementById(p.id);
    let y;
    if (el) { const r = el.getBoundingClientRect(); y = scrollY + r.top + r.height * p.parte - 90; }
    else y = p.y ? p.ratio * (document.documentElement.scrollHeight - innerHeight) : 0;
    scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'instant' });
  };

  /* Lo escrito en el formulario pasa a la página nueva (mismos id en los dos idiomas) */
  const CAMPOS = 'input[id]:not([type=hidden]):not([type=submit]):not([type=button]), textarea[id], select[id]';
  const guardarCampos = () => [...document.querySelectorAll(CAMPOS)]
    .map(c => ({ id: c.id, tipo: c.type, valor: c.value, marcado: c.checked }))
    .filter(c => /checkbox|radio/.test(c.tipo) ? c.marcado : c.valor !== '' && c.tipo !== 'select-one');
  const ponerCampos = (lista) => lista.forEach(c => {
    const el = document.getElementById(c.id);
    if (!el || el.type !== c.tipo) return;
    if (/checkbox|radio/.test(c.tipo)) el.checked = true;
    else if (!el.value) { el.value = c.valor; el.dispatchEvent(new Event('input', { bubbles: true })); }
  });

  const CABECERA = 'title, meta[name="description"], meta[name="robots"], link[rel="canonical"], link[rel="alternate"][hreflang], meta[property^="og:"], meta[name^="twitter:"], script[type="application/ld+json"]';
  /* Los enlaces del <head> (estilos, icono, manifest…) se escriben relativos; al cambiar la
     dirección de / a /en/ apuntarían a otra carpeta, así que se pasan a direcciones completas.
     Los preload y modulepreload no se tocan: cambiarles el href los vuelve a descargar. */
  const absolutas = () => document.head.querySelectorAll('[href]:not([rel="preload"]):not([rel="modulepreload"]), [src]').forEach(el => {
    if (el.hasAttribute('href')) el.setAttribute('href', el.href);
    if (el.hasAttribute('src')) el.setAttribute('src', el.src);
  });
  absolutas();
  const estilos = (doc, base) => [...doc.querySelectorAll('link[rel="stylesheet"]')].map(l => new URL(l.getAttribute('href'), base).href).sort().join(' ');

  async function cambiar(url, { foco = false } = {}) {
    if (ocupado) return;
    ocupado = true;
    try {
      const html = await descargar(url);
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const de = (document.documentElement.lang || 'es').slice(0, 2);

      /* ¿Es de verdad esta misma página en el otro idioma? */
      const pareja = doc.querySelector(`link[rel="alternate"][hreflang="${de}"]`);
      if (!pareja || ruta(pareja.getAttribute('href')) !== ruta(actual)) throw new Error('sin pareja');
      if (estilos(doc, url) !== estilos(document, actual)) throw new Error('otros estilos');

      /* Scripts de la otra página: los <script src> y, en la web hecha con SvelteKit, la lista
         #at-scripts (allí los carga src/routes/+layout.svelte, no van como <script src>) */
      const lista = doc.getElementById('at-scripts');
      const necesita = [...doc.querySelectorAll('script[src]')].map(s => s.getAttribute('src'))
        .concat(lista ? JSON.parse(lista.textContent) : []).map(src => new URL(src, url).href);
      const pendientes = necesita.filter(src => /\/js\/data\//.test(src) || !cargados.has(src));
      const sitio = posicion(), campos = guardarCampos();

      const poner = async () => {
        /* Fuera lo que tenían enganchado los módulos de la página anterior */
        AT.pagina.abort();
        AT.pagina = new AbortController();
        const antes = actual;
        actual = url;
        base(url);

        const raiz = document.documentElement, nuevo = doc.documentElement;
        raiz.lang = nuevo.lang;
        nuevo.dataset.raiz ? (raiz.dataset.raiz = nuevo.dataset.raiz) : delete raiz.dataset.raiz;
        raiz.classList.remove('wb-lock');
        document.head.querySelectorAll(CABECERA).forEach(el => el.remove());
        doc.head.querySelectorAll(CABECERA).forEach(el => document.head.appendChild(document.importNode(el, true)));
        absolutas();

        const vViejo = document.getElementById('hero-video');
        const mismoVideo = vViejo && vViejo.firstElementChild && doc.getElementById('hero-video') &&
          new URL(doc.getElementById('hero-video').dataset.video || '', url).href === new URL(vViejo.dataset.video || '', antes).href;

        doc.body.querySelectorAll('script').forEach(s => s.remove());
        [...document.body.attributes].forEach(a => document.body.removeAttribute(a.name));
        [...doc.body.attributes].forEach(a => document.body.setAttribute(a.name, a.value));
        document.body.replaceChildren(...doc.body.childNodes);

        /* El vídeo de la cabecera sigue reproduciéndose: vuelve el mismo elemento
           en el mismo instante (si se queda fuera de la página, el navegador lo pausa) */
        if (mismoVideo) {
          const vNuevo = document.getElementById('hero-video');
          [...vNuevo.attributes].forEach(a => { if (a.name !== 'class') vViejo.setAttribute(a.name, a.value); });
          vNuevo.replaceWith(vViejo);
        }

        await scripts(pendientes);
        AT.leerIdioma();
        raiz.classList.add('at-cambio');            // sin animaciones de entrada mientras se cambia
        AT.arrancar();
        ponerCampos(campos);
        volver(sitio);
        /* Lo que ya se ve (o ya has pasado) aparece directamente; lo de abajo sigue entrando al bajar */
        document.querySelectorAll('[data-reveal]').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in'); });
        requestAnimationFrame(() => requestAnimationFrame(() => raiz.classList.remove('at-cambio')));

        if (foco) document.querySelector(foco)?.focus({ preventScroll: true });
      };

      if (document.startViewTransition && !AT.reduceMotion) await document.startViewTransition(poner).updateCallbackDone;
      else await poner();
    } catch (err) {
      /* Plan B: navegación normal */
      location.href = url;
    } finally {
      ocupado = false;
    }
  }

  document.addEventListener('click', e => {
    const a = e.target.closest(BOTON);
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    cambiar(a.href, { foco: a.classList.contains('nav-lang') ? 'a.nav-lang' : 'a.foot-lang' });
  });

  /* Se empieza a descargar en cuanto el ratón o el dedo se acercan: el cambio es instantáneo */
  const antes = e => { const a = e.target.closest?.(BOTON); if (a) descargar(a.href).catch(() => {}); };
  ['pointerover', 'focusin', 'touchstart'].forEach(t => document.addEventListener(t, antes, { passive: true }));

})();
