/* Banco de pruebas: pinta un fotograma con los valores de la dirección (ver calabaza.html).
   Sin valores, la calabaza sale en su postura de reposo del instante 0 de la animación:
   la misma que la foto fija y el primer fotograma de la web (así el fundido no se nota).
   window.foto(calidad) vuelve a pintar y devuelve el fotograma en WebP con transparencia. */
const Q = new URLSearchParams(location.search), n = (k, d) => Q.has(k) ? +Q.get(k) : d;
const s = n('s', 800), cv = document.getElementById('c');
cv.style.width = cv.style.height = s + 'px';
(async () => {
  const c = await AT.calabazaGL.crear(cv, undefined, { software: true });
  if (c) {
    c.medir(s, s);
    const g = Math.PI / 180, a = AT.calabazaAnim.crear();
    if (Q.has('t')) for (let t = 0; t < n('t', 0); t += .05) a.avanzar(.05);
    const e = Object.assign({}, a.e);
    ['open', 'smileL', 'smileR', 'squint', 'light', 'breath', 'lev'].forEach(k => { if (Q.has(k)) e[k] = n(k, 0); });
    ['tilt', 'yaw', 'sway'].forEach(k => { if (Q.has(k)) e[k] = n(k, 0) * g; });
    c.pintar(e); c.gl.finish();
    window.foto = (calidad) => { c.pintar(e); return cv.toDataURL('image/webp', calidad); };
    /* para grabar demostraciones: pinta un estado cualquiera y lo devuelve en PNG */
    window.pintarEstado = (x) => { c.pintar(x); return cv.toDataURL('image/png'); };
  }
  document.documentElement.dataset.listo = c ? 'si' : 'sin-webgl';
})();
