/* =========================================================
   "Conoce a Alextoll": la puerta al portfolio (src/lib/componentes/Conoce.svelte, css/conoce.css)
   - La primera vez que se ve, la ventana "carga" alextoll.xyz: se escribe la
     dirección, se llena la barra y entra la portada del portfolio (vídeo).
   - Recorrido automático por los capítulos mientras se ve (una línea bajo cada
     capítulo marca el tiempo). Al pasar el ratón o el teclado por un capítulo,
     la ventana enseña esa sección y la dirección cambia a /#seccion.
   - La ventana se inclina un poco hacia el ratón y el cristal refleja la luz.
   - Detrás, un campo de caracteres plateados que respira y se ilumina cerca del ratón
     (se dibuja en un hilo aparte: js/modules/conoce-fondo.js).
   - Todo se para cuando la sección no se ve. Con "reducir movimiento" no se mueve nada:
     se queda la portada del portfolio y los capítulos siguen cambiando la imagen.
   - Cuenta en las estadísticas cuántos van al portfolio (AT.track('portfolio')).
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.conoce = {
  DUR: { inicio: 6500, otro: 3800 },          // ms que se queda cada capítulo en el recorrido automático
  RAMPA: ' .·:-=+*#%',                        // caracteres del fondo, de menos a más luz

  init() {
    AT.$$('.cx').forEach(sec => this.montar(sec));
  },

  montar(sec) {
    const S = AT.pagina.signal, quieto = AT.reduceMotion;
    const stage = sec.querySelector('.cx-stage'), shell = sec.querySelector('.cx-shell'), win = sec.querySelector('.cx-win');
    const view = sec.querySelector('.cx-view'), video = sec.querySelector('.cx-video'), host = sec.querySelector('.cx-host'), ruta = sec.querySelector('.cx-path');
    const indice = sec.querySelector('.cx-index'), filas = AT.$$('.cx-row', sec);
    if (!stage || !win || !view) return;
    const fotos = {};
    AT.$$('.cx-shot', sec).forEach(f => { if (f.dataset.cxShot !== 'inicio') fotos[f.dataset.cxShot] = f; });
    const ORDEN = ['inicio', ...filas.map(f => f.dataset.cx)];
    const raton = matchMedia('(hover: hover) and (pointer: fine)');
    const ancho = matchMedia('(min-width: 900px)');
    let actual = 'inicio', visible = false, sujeto = false, reloj = 0, vista = false;

    /* ---------- Estadísticas: quién se va al portfolio ---------- */
    sec.addEventListener('click', e => {
      if (e.target.closest('a[href^="https://alextoll.xyz"]') && AT.track) AT.track('portfolio');
    }, { signal: S });

    /* ---------- Vídeo de la portada del portfolio: solo se descarga si se va a ver ---------- */
    const red = navigator.connection || {};
    const conVideo = video && !quieto && !red.saveData && !/(^|-)2g$/.test(red.effectiveType || '');
    const video_ = () => {
      if (!conVideo) return;
      const toca = visible && actual === 'inicio' && !document.hidden;
      if (toca && !video.firstElementChild) {
        const b = video.dataset.video;
        video.innerHTML = `<source src="${b}.webm" type="video/webm"><source src="${b}.mp4" type="video/mp4">`;
        video.load();
      }
      if (toca && video.firstElementChild) video.play().catch(() => {});
      else video.pause();
    };
    if (conVideo) video.addEventListener('playing', () => video.classList.add('is-on'), { signal: S });

    /* ---------- La dirección: se escribe letra a letra con un pequeño "descifrado" ---------- */
    const GLIFOS = 'abcdefghijklmnopqrstuvwxyz0123456789#/-';
    let rutaAnim = 0;
    const escribirRuta = (txt) => {
      cancelAnimationFrame(rutaAnim);
      if (quieto) { ruta.textContent = txt; return; }
      const t0 = performance.now(), largo = Math.max(txt.length, 1), dura = 120 + largo * 32;
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / dura), fijas = Math.floor(p * txt.length);
        let s = txt.slice(0, fijas);
        for (let i = fijas; i < txt.length; i++) s += txt[i] === '/' || txt[i] === '#' ? txt[i] : GLIFOS[(Math.random() * GLIFOS.length) | 0];
        ruta.textContent = s;
        if (p < 1) rutaAnim = requestAnimationFrame(paso);
      };
      rutaAnim = requestAnimationFrame(paso);
    };
    AT.alSalir(() => cancelAnimationFrame(rutaAnim));

    /* ---------- Enseñar un capítulo ---------- */
    const dur = (id) => id === 'inicio' ? this.DUR.inicio : this.DUR.otro;
    const mostrar = (id, auto) => {
      if (id !== actual) {
        Object.entries(fotos).forEach(([k, f]) => f.classList.toggle('is-on', k === id));
        if (!quieto) { view.classList.remove('is-swap'); void view.offsetWidth; view.classList.add('is-swap'); }
        escribirRuta(id === 'inicio' ? '' : '/#' + id);
        actual = id;
      }
      filas.forEach(f => {
        const on = f.dataset.cx === id;
        if (on && auto) {                       // vuelve a empezar la línea de tiempo
          f.style.setProperty('--dur', dur(id) + 'ms');
          f.classList.remove('is-on', 'is-held'); void f.offsetWidth;
        }
        f.classList.toggle('is-on', on);
        f.classList.toggle('is-held', on && !auto);
      });
      video_();
    };

    /* ---------- Recorrido automático ---------- */
    const programar = () => {
      clearTimeout(reloj);
      if (quieto || !vista || !visible || sujeto || document.hidden) return;
      reloj = setTimeout(() => {
        mostrar(ORDEN[(ORDEN.indexOf(actual) + 1) % ORDEN.length], true);
        programar();
      }, dur(actual));
    };
    const sujetar = (si) => {
      if (sujeto === si) return;
      sujeto = si;
      if (!si) mostrar(actual, true);
      programar();
    };
    AT.alSalir(() => clearTimeout(reloj));

    /* Ratón y teclado: el capítulo que señalas se queda en la ventana */
    filas.forEach(f => {
      f.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { sujetar(true); mostrar(f.dataset.cx, false); } }, { signal: S });
      f.addEventListener('focus', () => { sujetar(true); mostrar(f.dataset.cx, false); }, { signal: S });
    });
    indice.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !indice.contains(document.activeElement)) sujetar(false); }, { signal: S });
    indice.addEventListener('focusout', e => { if (!indice.contains(e.relatedTarget)) sujetar(false); }, { signal: S });
    /* Mirando la ventana: el recorrido espera */
    shell.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') sujetar(true); }, { signal: S });
    shell.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') sujetar(false); }, { signal: S });

    /* ---------- Fondo de caracteres (en un hilo aparte) ---------- */
    const fondo = this.fondo(sec, stage, shell, () => visible && !document.hidden);

    /* ---------- Inclinación de la ventana, luz y reflejo (solo ratón, pantallas anchas) ---------- */
    let px = -1e4, py = -1e4, tiltRaf = 0;
    if (!quieto) {
      stage.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse') return;
        const r = stage.getBoundingClientRect();
        px = e.clientX - r.left; py = e.clientY - r.top;
        if (tiltRaf) return;
        tiltRaf = requestAnimationFrame(() => {
          tiltRaf = 0;
          stage.style.setProperty('--mx', px + 'px');
          stage.style.setProperty('--my', py + 'px');
          fondo.raton(px, py);
          if (!ancho.matches || !raton.matches || sec.classList.contains('is-armada')) return;
          const s = shell.getBoundingClientRect();
          const nx = Math.max(-1, Math.min(1, (e.clientX - (s.left + s.width / 2)) / (s.width * .8)));
          const ny = Math.max(-1, Math.min(1, (e.clientY - (s.top + s.height / 2)) / (s.height * .8)));
          win.style.setProperty('--ry', (-7 + nx * 6).toFixed(2) + 'deg');
          win.style.setProperty('--rx', (3 - ny * 4).toFixed(2) + 'deg');
          win.style.setProperty('--gx', (nx * 9).toFixed(1) + '%');
        });
      }, { signal: S });
      stage.addEventListener('pointerleave', () => {
        px = py = -1e4;
        fondo.raton(px, py);
        ['--ry', '--rx', '--gx'].forEach(p => win.style.removeProperty(p));
      }, { signal: S });
      AT.alSalir(() => cancelAnimationFrame(tiltRaf));
    }

    /* ---------- Arranque: la ventana carga el portfolio la primera vez que se ve ---------- */
    const arrancar = () => {
      if (vista) return;
      if (quieto) { vista = true; return; }
      const nombre = host.textContent;
      host.textContent = '';
      sec.classList.add('is-cargando');
      let i = 0;
      const teclear = setInterval(() => {
        host.textContent = nombre.slice(0, ++i);
        if (i >= nombre.length) clearInterval(teclear);
      }, 48);
      const entrar = setTimeout(() => {
        sec.classList.remove('is-armada');
        sec.classList.add('is-vista');
        vista = true;
        video_();
        setTimeout(() => sec.classList.remove('is-cargando'), 900);
        // primer capítulo después de un rato en la portada
        programar();
      }, 48 * nombre.length + 650);
      AT.alSalir(() => { clearInterval(teclear); clearTimeout(entrar); });
    };
    if (!quieto) sec.classList.add('is-armada');

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        if (visible && en.intersectionRatio >= .3) arrancar();
        video_(); programar(); fondo.despertar();
      }, { threshold: [0, .3] });
      io.observe(sec);
      AT.alSalir(() => io.disconnect());
    } else { visible = true; arrancar(); }
    document.addEventListener('visibilitychange', () => { video_(); programar(); fondo.despertar(); }, { signal: S });
  },

  /* Campo de caracteres plateados alrededor de la ventana.
     Se dibuja en un hilo aparte (js/modules/conoce-fondo.js, OffscreenCanvas): aquí solo se le
     manda el tamaño, dónde está la ventana, el ratón y si debe dibujar. La hoja de caracteres
     se pinta aquí, con la tipografía de la página, y se le pasa ya hecha.
     Si el navegador no puede (sin OffscreenCanvas), no hay fondo: queda la luz suave del CSS. */
  fondo(sec, stage, shell, activo) {
    const nada = { despertar() {}, raton() {} };
    const cv = sec.querySelector('.cx-ascii');
    if (!cv || AT.reduceMotion || !('transferControlToOffscreen' in cv) || !window.Worker || !window.createImageBitmap) return nada;
    const yo = document.querySelector('script[src*="modules/conoce.js"]');
    if (!yo) return nada;
    let w;
    try { w = new Worker(yo.src.replace(/conoce\.js(\?.*)?$/, 'conoce-fondo.js')); } catch (e) { return nada; }
    const off = cv.transferControlToOffscreen();
    w.postMessage({ canvas: off, n: this.RAMPA.length }, [off]);
    AT.alSalir(() => w.terminate());
    const R = this.RAMPA, N = R.length;
    let listo = false, encendido = null;

    /* Hoja de caracteres: cada carácter de la rampa, de menos a más luz, en una fila */
    const hoja = (celda, dpr) => {
      const c = Math.ceil(celda * dpr), h = document.createElement('canvas');
      h.width = c * N; h.height = c;
      const g = h.getContext('2d');
      g.font = `500 ${Math.round(celda * .95 * dpr)}px "JetBrains Mono", ui-monospace, monospace`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let k = 1; k < N; k++) {
        g.fillStyle = `rgba(216,216,222,${(.1 + .62 * (k / (N - 1)) ** 1.15).toFixed(3)})`;
        g.fillText(R[k], k * c + c / 2, c / 2 + dpr * .5);
      }
      return { h, c };
    };
    /* Hueco de la ventana (un poco más pequeño: está inclinada) y centro del halo */
    const ventana = () => {
      const a = stage.getBoundingClientRect(), b = shell.querySelector('.cx-win').getBoundingClientRect();
      return {
        hueco: [b.left - a.left + 14, b.top - a.top + 10, b.right - a.left - 14, b.bottom - a.top - 10],
        centro: [(b.left + b.right) / 2 - a.left, (b.top + b.bottom) / 2 - a.top, b.width * .8, b.height * 1.05]
      };
    };
    const medir = async () => {
      const W = stage.clientWidth, H = stage.clientHeight, dpr = Math.min(1.5, devicePixelRatio || 1), celda = W < 700 ? 11 : 13;
      const { h, c } = hoja(celda, dpr);
      const bmp = await createImageBitmap(h);
      w.postMessage({ medidas: { W, H, dpr, celda }, hoja: bmp, c, ventana: ventana() }, [bmp]);
    };
    const despertar = () => {
      if (!listo) return;
      const si = activo();
      if (si !== encendido) { encendido = si; w.postMessage({ activo: si }); }
    };

    (document.fonts && document.fonts.load ? document.fonts.load('500 13px "JetBrains Mono"').catch(() => {}) : Promise.resolve())
      .then(medir).then(() => { listo = true; cv.classList.add('is-on'); despertar(); }).catch(() => {});
    if ('ResizeObserver' in window) {
      let t = 0;
      const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => { if (listo) medir(); }, 120); });
      ro.observe(stage);
      AT.alSalir(() => { ro.disconnect(); clearTimeout(t); });
    }
    // la ventana se mueve (al entrar y al inclinarse): volver a decirle al fondo dónde está
    sec.addEventListener('transitionend', e => {
      if (listo && e.target.classList.contains('cx-win') && e.propertyName === 'transform') w.postMessage({ ventana: ventana() });
    }, { signal: AT.pagina.signal });
    return { despertar, raton(x, y) { w.postMessage({ raton: [x, y] }); } };
  }
};
