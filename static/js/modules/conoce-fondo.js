/* =========================================================
   Fondo de caracteres de "Conoce a Alextoll" (js/modules/conoce.js)
   Se ejecuta en un hilo aparte (Web Worker) y dibuja en un OffscreenCanvas:
   así nunca quita tiempo al scroll ni a las animaciones de la página.

   - Lo que no cambia se calcula una vez (prep): qué celdas se dibujan (fuera de la
     ventana y dentro del halo), su brillo base y una textura fija por celda.
   - Cada fotograma solo hace sumas y productos: las olas se separan en columnas y filas
     (sin(a + b) = sin a·cos b + cos a·sin b), así no hay senos por celda.
   - Los caracteres vienen ya pintados en una "hoja" (la hace la página con su tipografía)
     y se copian con drawImage. Unos 24 fotogramas por segundo: el halo se mueve despacio.

   Mensajes que recibe:
     { canvas, n }                     el lienzo (OffscreenCanvas) y cuántos caracteres hay
     { medidas: {W, H, dpr, celda}, hoja, c }   tamaño, y la hoja de caracteres (ImageBitmap)
     { ventana: { hueco, centro } }    dónde está la ventana (no se dibuja debajo) y el centro del halo
     { raton: [x, y] }                 ratón dentro del escenario ([-1e4, -1e4] si no está)
     { activo: true | false }          dibujar o parar (sección fuera de la vista, pestaña oculta…)
   ========================================================= */
let cv = null, ctx = null, hoja = null, N = 10, c = 13;
let W = 0, H = 0, dpr = 1, celda = 13, cols = 0, filas = 0;
let hueco = [0, 0, 0, 0], centro = [0, 0, 1, 1];
let celdas = null, usada = null, sa, ca, sx, cy, sb, cb;
let mx = -1e4, my = -1e4, activo = false, reloj = 0;

const prep = () => {
  if (!cols) return;
  const [hx, hy, rx, ry] = centro, lista = [];
  usada = new Uint8Array(cols * filas);
  for (let j = 0; j < filas; j++) {
    const y = j * celda + celda / 2, dy = (y - hy) / ry;
    for (let i = 0; i < cols; i++) {
      const x = i * celda + celda / 2;
      if (x > hueco[0] && x < hueco[2] && y > hueco[1] && y < hueco[3]) { usada[j * cols + i] = 2; continue; }
      const dx = (x - hx) / rx, halo = Math.exp(-(dx * dx + dy * dy) * 1.5) * 1.45 - .08;
      if (halo <= .02) continue;
      const grano = ((Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1 + 1) % 1;
      lista.push(x, y, halo * (.7 + .5 * grano), i, j);
      usada[j * cols + i] = 1;
    }
  }
  celdas = Float32Array.from(lista);
};

const medir = () => {
  cols = Math.ceil(W / celda); filas = Math.ceil(H / celda);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  sa = new Float32Array(cols); ca = new Float32Array(cols); sx = new Float32Array(cols);
  cy = new Float32Array(filas); sb = new Float32Array(filas); cb = new Float32Array(filas);
  for (let i = 0; i < cols; i++) { const x = i * celda + celda / 2; sa[i] = Math.sin(x * .006); ca[i] = Math.cos(x * .006); }
};

const dibujar = (x, y, v) => {
  const k = v >= 1 ? N - 1 : Math.floor(v * (N - .2));
  if (k > 0) ctx.drawImage(hoja, k * c, 0, c, c, Math.round((x - celda / 2) * dpr), Math.round((y - celda / 2) * dpr), c, c);
};

const pintar = () => {
  const s = performance.now() * .001, conRaton = mx > -1e3;
  for (let i = 0; i < cols; i++) sx[i] = Math.sin((i * celda + celda / 2) * .017 + s * .9);
  for (let j = 0; j < filas; j++) {
    const y = j * celda + celda / 2;
    cy[j] = Math.cos(y * .021 - s * .7); sb[j] = Math.sin(y * .006 - s * 1.3); cb[j] = Math.cos(y * .006 - s * 1.3);
  }
  ctx.clearRect(0, 0, cv.width, cv.height);
  // el halo: olas lentas sobre el brillo base, y más luz cerca del ratón
  for (let n = 0; n < celdas.length; n += 5) {
    const x = celdas[n], y = celdas[n + 1], i = celdas[n + 3], j = celdas[n + 4];
    const ola = .5 + .5 * sx[i] * cy[j] + .18 * (sa[i] * cb[j] + ca[i] * sb[j]);
    let v = celdas[n + 2] * (.28 + .62 * ola);
    if (conRaton) { const pd = ((x - mx) ** 2 + (y - my) ** 2) / 12100; if (pd < 6) v += Math.exp(-pd) * .55; }
    dibujar(x, y, v);
  }
  // fuera del halo solo se enciende lo que está cerca del ratón (unos 110 px de radio)
  if (conRaton) {
    const r = 270, i0 = Math.max(0, Math.floor((mx - r) / celda)), i1 = Math.min(cols - 1, Math.ceil((mx + r) / celda));
    const j0 = Math.max(0, Math.floor((my - r) / celda)), j1 = Math.min(filas - 1, Math.ceil((my + r) / celda));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (usada[j * cols + i]) continue;
      const x = i * celda + celda / 2, y = j * celda + celda / 2, pd = ((x - mx) ** 2 + (y - my) ** 2) / 12100;
      if (pd < 6) dibujar(x, y, Math.exp(-pd) * .55);
    }
  }
};

const bucle = () => {
  clearTimeout(reloj);
  if (!activo || !celdas || !hoja) return;
  pintar();
  reloj = setTimeout(bucle, 40);
};

onmessage = ({ data: d }) => {
  if (d.canvas) { cv = d.canvas; ctx = cv.getContext('2d'); N = d.n || N; }
  if (d.medidas) { ({ W, H, dpr, celda } = d.medidas); medir(); }
  if (d.hoja) { if (hoja && hoja.close) hoja.close(); hoja = d.hoja; c = d.c; }
  if (d.ventana) { hueco = d.ventana.hueco; centro = d.ventana.centro; }
  if (d.medidas || d.ventana) prep();
  if (d.raton) [mx, my] = d.raton;
  if ('activo' in d && d.activo !== activo) { activo = d.activo; bucle(); }
  else if (d.medidas || d.ventana) bucle();
};
