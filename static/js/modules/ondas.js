/* =========================================================
   Ondas plateadas del fondo de la cabecera (webs.html)
   ---------------------------------------------------------
   Muchas líneas finas que forman una cinta de seda que se mueve
   muy despacio. Se dibuja en un <canvas id="ondas">.
   - Solo se anima mientras se ve la cabecera y la pestaña está activa.
   - Con "reducir movimiento" se dibuja una vez y se queda quieta.
   - Resolución limitada (como mucho 1,5x) para no cargar el móvil.
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.ondas = {
  LINEAS: 38,

  init() {
    const cv = AT.$('#ondas'); if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, trazo = null, t = 8, visible = true, raf = 0, antes = 0;

    const medir = () => {
      const r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* Se desvanece por la izquierda (donde va el texto) y por los bordes */
      trazo = ctx.createLinearGradient(0, 0, W, 0);
      trazo.addColorStop(0, 'rgba(255,255,255,0)');
      trazo.addColorStop(W < 900 ? 0.05 : 0.4, 'rgba(255,255,255,0.08)');
      trazo.addColorStop(0.7, 'rgba(255,255,255,1)');
      trazo.addColorStop(1, 'rgba(255,255,255,0.35)');
    };

    const dibujar = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = trazo;
      ctx.lineWidth = 1;
      const n = this.LINEAS, paso = Math.max(10, W / 90), movil = W < 900;
      for (let i = 0; i < n; i++) {
        const c = i / (n - 1) - .5;                       // -0.5 … 0.5 (centro de la cinta)
        ctx.globalAlpha = 0.05 + 0.5 * Math.pow(1 - Math.abs(c) * 2, 2.2);
        ctx.beginPath();
        for (let x = -20; x <= W + 20; x += paso) {
          const u = x / W;
          /* Línea base: sube de izquierda a derecha y pasa por debajo de los dispositivos */
          const base = H * (movil ? 0.9 - 0.16 * u : 0.86 - 0.3 * u);
          /* La cinta se abre y se cierra (se "retuerce") a lo largo */
          const abre = H * (0.035 + 0.05 * (1 + Math.sin(u * 5.2 + t * 0.35)));
          const y = base
            + Math.sin(u * 4.1 + t * 0.42 + c * 0.9) * H * 0.07
            + Math.sin(u * 9.3 - t * 0.27 + c * 1.6) * H * 0.018
            + c * abre * Math.sin(u * 3.4 - t * 0.31 + 1.2);
          if (x < -10) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const bucle = (ahora) => {
      raf = 0;
      if (!visible || document.hidden) return;
      /* ~30 imágenes por segundo bastan para algo tan lento */
      if (ahora - antes > 32) { t += (ahora - antes < 200 ? ahora - antes : 32) / 1000; antes = ahora; dibujar(); }
      raf = requestAnimationFrame(bucle);
    };
    const arrancar = () => { if (!raf && !AT.reduceMotion) { antes = performance.now(); raf = requestAnimationFrame(bucle); } };

    medir(); dibujar();
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { medir(); dibujar(); }, 150); }, { signal: AT.pagina.signal });
    if (AT.reduceMotion) return;

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) arrancar(); });
      io.observe(cv);
      AT.alSalir(() => io.disconnect());
    }
    AT.alSalir(() => { visible = false; });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) arrancar(); }, { signal: AT.pagina.signal });
    arrancar();
  }
};
