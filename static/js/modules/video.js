/* =========================================================
   Vídeo de fondo de la cabecera (portada y ordenadores.html)
   - Elige la versión horizontal o vertical según la pantalla y
     solo descarga esa (WebM y, si el navegador no lo admite, MP4).
     <video data-video="ruta-horizontal" data-video-movil="ruta-vertical" data-video-hd="ruta-2560">
     (sin data-video-movil se usa "ruta-horizontal-vertical"; data-video-hd es opcional:
     en pantallas grandes o retina, la versión horizontal de más resolución).
   - No lo carga si el visitante pide "reducir movimiento", tiene
     activado el ahorro de datos o una conexión muy lenta: se queda
     el póster (imagen fija que pone el CSS).
   - Aparece con un fundido cuando empieza a reproducirse.
   - Se para solo cuando la cabecera no se ve (ahorra batería).
   - Botón de pausa; si lo paras, se recuerda en este navegador.
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.video = {
  KEY: 'alextoll_video',

  init() {
    const v = AT.$('#hero-video'), btn = AT.$('#hero-pause');
    if (!v || !v.dataset.video) return;
    const red = navigator.connection || {};
    if (AT.reduceMotion || red.saveData || /(^|-)2g$/.test(red.effectiveType || '')) return;

    const alto = matchMedia('(max-aspect-ratio: 4/5)');     // el mismo corte que en el CSS
    let parado = AT.store.get(this.KEY) === 'parado', visible = true;

    v.muted = true;                                          // sin sonido: necesario para el autoplay (iOS)
    v.addEventListener('playing', () => v.classList.add('is-on'), { signal: AT.pagina.signal });

    const fuentes = () => {
      const grande = v.dataset.videoHd && innerWidth * (devicePixelRatio || 1) >= 2100;   // retina o más de Full HD
      const base = alto.matches ? (v.dataset.videoMovil || v.dataset.video + '-vertical')
        : grande ? v.dataset.videoHd : v.dataset.video;
      v.classList.remove('is-on');
      v.innerHTML = `<source src="${base}.webm" type="video/webm"><source src="${base}.mp4" type="video/mp4">`;
      v.load();
      decidir();
    };
    const decidir = () => {
      if (!parado && visible && !document.hidden && v.firstElementChild) v.play().catch(() => {}); // si el navegador no deja, se queda el póster
      else v.pause();
      if (btn) {
        btn.setAttribute('aria-pressed', String(parado));
        btn.setAttribute('aria-label', parado ? AT.t('Reproducir el vídeo de fondo', 'Play the background video') : AT.t('Pausar el vídeo de fondo', 'Pause the background video'));
      }
    };

    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        parado = !parado;
        parado ? AT.store.set(this.KEY, 'parado') : AT.store.del(this.KEY);
        decidir();
      });
    }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; decidir(); });
      io.observe(v);
      AT.alSalir(() => io.disconnect());
    }
    document.addEventListener('visibilitychange', decidir, { signal: AT.pagina.signal });
    alto.addEventListener?.('change', fuentes, { signal: AT.pagina.signal });              // al girar el móvil
    /* El vídeo espera a que la página termine de cargar y el navegador quede libre:
       así la primera pintura y la entrada del texto van fluidas (mientras, se ve el póster). */
    const empezar = () => (window.requestIdleCallback || (f => setTimeout(f, 200)))(() => { if (!v.firstElementChild) fuentes(); }, { timeout: 1200 });
    document.readyState === 'complete' ? empezar() : addEventListener('load', empezar, { once: true, signal: AT.pagina.signal });
  }
};
