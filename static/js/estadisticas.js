/* =========================================================
   Panel privado de estadísticas (estadisticas.html)
   Pide los datos a /api/estadisticas con tu clave y los dibuja.
   ========================================================= */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const KEY = 'alextoll_stats_key';
  const fmt = (n) => n.toLocaleString('es-ES');
  const fecha = (iso, larga) => new Date(iso + 'T12:00:00Z').toLocaleDateString('es-ES', larga ? { weekday: 'short', day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short' });
  const store = {
    get: (k) => { try { return localStorage.getItem(k) || sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v, recordar) => { try { (recordar ? localStorage : sessionStorage).setItem(k, v); } catch (e) {} },
    del: (k) => { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) {} }
  };

  const login = $('#login'), panel = $('#panel'), err = $('#login-err');
  let clave = store.get(KEY), dias = 30, datos = null;

  const MENSAJES = {
    'clave-incorrecta': 'Clave incorrecta.',
    'falta-clave': 'Falta configurar la clave STATS_KEY en el servidor. Mira docs/ESTADISTICAS.md.',
    'sin-funcion': 'No encuentro el contador en este servidor. Las estadísticas solo funcionan en la web publicada desde GitHub o con netlify deploy (ver docs/ESTADISTICAS.md).',
    'red': 'No se ha podido conectar. Revisa tu conexión y vuelve a intentarlo.'
  };

  async function pedir(n) {
    let res;
    try { res = await fetch(`/api/estadisticas?dias=${n}`, { headers: { Authorization: `Bearer ${clave}` }, cache: 'no-store' }); }
    catch (e) { throw new Error('red'); }
    if (res.status === 404 || res.status === 405) throw new Error('sin-funcion');
    let j = null; try { j = await res.json(); } catch (e) {}
    if (!res.ok) throw new Error(j?.error || 'red');
    return j.dias;
  }

  async function cargar() {
    panel.classList.add('is-loading');
    try {
      datos = await pedir(dias);
      login.hidden = true; panel.hidden = false;
      pintar();
    } catch (e) {
      if (e.message === 'clave-incorrecta') { store.del(KEY); clave = null; }
      panel.hidden = true; login.hidden = false;
      err.textContent = MENSAJES[e.message] || MENSAJES.red;
    } finally {
      panel.classList.remove('is-loading');
    }
  }

  /* ---------- Totales ---------- */
  function sumar(campo) {
    const t = {};
    datos.forEach(d => Object.entries(d[campo] || {}).forEach(([k, v]) => { t[k] = (t[k] || 0) + v; }));
    return t;
  }

  function pintar() {
    const visitas = datos.reduce((s, d) => s + (d.visitas || 0), 0);
    const ev = sumar('eventos');
    const contactos = (ev.whatsapp || 0) + (ev.llamada || 0) + (ev.formulario || 0) + (ev.email || 0);
    $('#t-visitas').textContent = fmt(visitas);
    $('#t-visitas-sub').textContent = `en los últimos ${dias} días`;
    $('#t-wa').textContent = fmt(ev.whatsapp || 0);
    $('#t-tel').textContent = fmt(ev.llamada || 0);
    $('#t-form').textContent = fmt(ev.formulario || 0);
    $('#t-resena').textContent = fmt(ev.resena || 0);
    $('#t-portfolio').textContent = fmt(ev.portfolio || 0);
    $('#t-conv').textContent = visitas ? (contactos / visitas * 100).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' %' : '0 %';
    grafico();
    tabla();
    lista('#l-paginas', sumar('paginas'), (k) => k === '/' ? 'Portada' : k.replace(/^\//, '').replace(/\.html$/, ''));
    lista('#l-origenes', sumar('origenes'));
    lista('#l-disp', sumar('dispositivos'));
  }

  /* ---------- Gráfico de columnas: visitas por día ---------- */
  function niceMax(v) {
    if (v <= 4) return 4;
    const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
  }

  function grafico() {
    const box = $('#chart'), tip = $('#tip');
    const W = Math.max(300, box.clientWidth), H = 240, m = { t: 12, r: 8, b: 26, l: 36 };
    const n = datos.length, iw = W - m.l - m.r, ih = H - m.t - m.b;
    const max = niceMax(Math.max(...datos.map(d => d.visitas || 0)));
    const band = iw / n, bw = Math.max(2, Math.min(24, band - 2)); // columnas finas, separadas por al menos 2px
    const y = (v) => m.t + ih - (v / max) * ih;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('aria-label', `Visitas por día en los últimos ${n} días. Usa las flechas para recorrer los días.`);

    const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
    const grid = el('g', { class: 'grid' }, svg), axis = el('g', { class: 'axis' }, svg);
    for (let i = 0; i <= 4; i++) {
      const v = max / 4 * i, yy = Math.round(y(v)) + .5;
      el('line', { x1: m.l, x2: W - m.r, y1: yy, y2: yy }, grid);
      el('text', { x: m.l - 8, y: yy + 4, 'text-anchor': 'end' }, axis).textContent = fmt(Math.round(v * 10) / 10);
    }
    const cada = Math.ceil(n / 7); // como mucho ~7 fechas en el eje
    const bars = [], hits = [];
    datos.forEach((d, i) => {
      const cx = m.l + band * i + band / 2, v = d.visitas || 0, top = y(v), h = m.t + ih - top;
      let bar = null;
      if (v > 0) {
        const x0 = cx - bw / 2, r = Math.min(4, bw / 2, h);
        bar = el('path', { class: 'bar', d: `M${x0},${m.t + ih} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + bw - r} Q${x0 + bw},${top} ${x0 + bw},${top + r} V${m.t + ih} Z` }, svg);
      }
      bars.push(bar);
      hits.push(el('rect', { class: 'hit', x: m.l + band * i, y: m.t, width: band, height: ih, 'data-i': i }, svg));
      if (i % cada === 0 || i === n - 1) el('text', { x: cx, y: H - 6, 'text-anchor': 'middle' }, axis).textContent = fecha(d.dia);
    });

    let actual = -1;
    const mostrar = (i) => {
      if (actual >= 0 && bars[actual]) bars[actual].classList.remove('is-on');
      actual = i;
      if (i < 0) { tip.hidden = true; return; }
      if (bars[i]) bars[i].classList.add('is-on');
      const d = datos[i], cx = m.l + band * i + band / 2;
      tip.replaceChildren();
      const b = document.createElement('b'); b.textContent = `${fmt(d.visitas || 0)} ${d.visitas === 1 ? 'visita' : 'visitas'}`;
      const s = document.createElement('span'); s.textContent = fecha(d.dia, true);
      tip.append(b, s);
      tip.hidden = false;
      tip.style.left = `${cx / W * 100}%`;
      tip.style.top = `${y(d.visitas || 0) / H * 100}%`;
    };
    svg.addEventListener('pointermove', (e) => { const h = e.target.closest('.hit'); if (h) mostrar(+h.dataset.i); });
    svg.addEventListener('pointerleave', () => mostrar(-1));
    svg.addEventListener('focus', () => mostrar(actual >= 0 ? actual : n - 1));
    svg.addEventListener('blur', () => mostrar(-1));
    svg.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
      e.preventDefault(); mostrar(Math.max(0, Math.min(n - 1, (actual < 0 ? n - 1 : actual) + d)));
    });

    box.querySelector('svg')?.remove();
    box.prepend(svg);
    tip.hidden = true;
  }

  /* Tabla con los mismos datos (para quien no use el gráfico) */
  function tabla() {
    const tb = $('#tabla tbody'); tb.replaceChildren();
    [...datos].reverse().forEach(d => {
      const tr = document.createElement('tr');
      const a = document.createElement('td'); a.textContent = fecha(d.dia, true);
      const b = document.createElement('td'); b.textContent = fmt(d.visitas || 0);
      tr.append(a, b); tb.appendChild(tr);
    });
  }

  /* Listas ordenadas con una barra fina proporcional (sin pista de fondo) */
  function lista(sel, obj, nombre = (k) => k) {
    const ul = $(sel); ul.replaceChildren();
    const filas = Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 8);
    if (!filas.length) { const p = document.createElement('li'); p.className = 'empty'; p.textContent = 'Todavía no hay datos en este periodo.'; ul.appendChild(p); return; }
    const top = filas[0][1];
    filas.forEach(([k, v]) => {
      const li = document.createElement('li');
      const a = document.createElement('span'); a.className = 'name'; a.textContent = nombre(k);
      const b = document.createElement('span'); b.className = 'n'; b.textContent = fmt(v);
      const bar = document.createElement('span'); bar.className = 'bar-in'; bar.style.width = `${v / top * 100}%`;
      li.append(a, b, bar); ul.appendChild(li);
    });
  }

  /* ---------- Controles ---------- */
  $('#login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    clave = $('#clave').value.trim(); if (!clave) return;
    store.set(KEY, clave, $('#recordar').checked);
    err.textContent = '';
    cargar();
  });
  $('#range').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-dias]'); if (!b) return;
    dias = +b.dataset.dias;
    $('#range').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    cargar();
  });
  $('#salir').addEventListener('click', () => { store.del(KEY); clave = null; panel.hidden = true; login.hidden = false; $('#clave').value = ''; });
  const noContar = $('#no-contar');
  try { noContar.checked = !!JSON.parse(localStorage.getItem('alextoll_no_contar')); } catch (e) {}
  noContar.addEventListener('change', () => { try { localStorage.setItem('alextoll_no_contar', JSON.stringify(noContar.checked)); } catch (e) {} });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (datos && !panel.hidden) grafico(); }, 150); });

  if (clave) cargar(); else login.hidden = false;
})();
