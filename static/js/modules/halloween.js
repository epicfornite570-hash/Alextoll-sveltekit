/* =========================================================
   Fondo de Halloween de la cabecera (portada, edición temporal)
   ---------------------------------------------------------
   Sustituye al vídeo mientras HALLOWEEN = true en src/lib/paginas/Portada.svelte.
   Aquí se junta todo y se gestiona el rendimiento:
   - Ondas plateadas en Canvas 2D (vuelta de 12 s), con la sombra de la
     calabaza y su reflejo ámbar (que cambia con la luz interior).
   - Calabaza 3D en WebGL (modelo/materiales/luz: calabaza-gl.js;
     animaciones: calabaza-anim.js). Mientras carga, si no hay WebGL o si
     falla, se ve la foto fija de la misma calabaza con el mismo encuadre
     (assets/img/halloween/). Cuando la escena está lista, la sustituye con
     un fundido, sin moverse ni cambiar de tamaño.
   - Ambiente (halloween-ambiente.js): ascuas que salen de la boca y los ojos
     y murciélagos que cruzan de vez en cuando a lo lejos. Cuando la calabaza
     respira (y algo menos cuando desafía) sale una onda de luz por las líneas.
   - Un solo bucle para todo, a unos 30 dibujos por segundo.
   - Calidad adaptable: se mide lo que tarda este equipo en pintar la
     calabaza y se elige la resolución interna para que quepa holgada en
     cada dibujo (densidad máxima 1,5x; en móvil algo menos). Si ni con la
     mínima va bien, la calabaza se queda en foto y solo se mueven las ondas.
   - La calabaza solo se vuelve a pintar cuando cambia la cara o la luz; la
     levitación, el balanceo y la respiración mueven el lienzo con CSS.
   - Se para fuera de la cabecera, con la pestaña oculta o con el botón de
     pausa (se recuerda, igual que con el vídeo). Con "reducir movimiento"
     se ve la foto quieta (el botón la pone en marcha).
   - Al cambiar ES/EN o salir se suelta todo (WebGL incluido).
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.halloween = {
  KEY: 'alextoll_video',   // la misma preferencia que el botón del vídeo
  t: 0,                    // instante de las ondas: sigue igual al cambiar ES/EN
  anim: null,              // la animación de la calabaza también sigue

  init() {
    const hero = AT.$('#inicio'), cv = AT.$('#hw-ondas'), btn = AT.$('#hero-pause');
    const caja = AT.$('#hw-calabaza'), foto = caja && AT.$('.hw-foto', caja), cv3 = caja && AT.$('.hw-3d', caja);
    const cvM = AT.$('#hw-murcielagos'), cvA = caja && AT.$('.hw-ascuas', caja), cvB = caja && AT.$('.hw-bruma', caja);
    if (!hero || !cv) return;
    const ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;                                    // sin canvas: queda la foto

    const yo = this, ARRIBA = .54;   // las ondas van del 61 % al 99 % del alto de la cabecera
    const BASE = [0, -.67, 0];        // punto de la calabaza bajo el que va la sombra
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const forzada = +((location.hash.match(/hw-calidad=([\d.]+)/) || [])[1] || 0);   // solo para pruebas
    let W = 1, H = 1, trazos = [], raf = 0, antes = 0, visible = true, vivo = true;
    /* Sin gráfica (WebGL por software: algunos equipos y la prueba de PageSpeed) mover el fondo frena
       toda la página: empieza quieto, como con «reducir movimiento», y el botón lo pone en marcha */
    const software = !!forzada || /hw-software/.test(location.hash);   // pruebas: dejar el 3D aunque no haya gráfica
    const sinGrafica = !software && AT.calabazaGL && AT.calabazaGL.sinGrafica();
    let parado = motion.matches || sinGrafica || AT.store.get(this.KEY) === 'parado';
    let gl3 = null, q = 1, qTope = 1, cargando = false, sinGL = !cv3, lentos = 0, sombra = null;
    let bien = 0, espera = 8000, subida = -1e9;   // para recuperar la calidad cuando el equipo vuelve a ir bien
    if (!yo.anim && AT.calabazaAnim) yo.anim = AT.calabazaAnim.crear();
    const anim = yo.anim;
    const amb = AT.halloweenAmbiente, asc = amb && cvA ? amb.ascuas(cvA) : null, mur = amb && cvM ? amb.murcielagos(cvM) : null;
    const nie = amb ? amb.niebla() : null, ctxB = nie && cvB && cvB.getContext ? cvB.getContext('2d') : null;
    const vertical = matchMedia('(max-width: 700px), (max-aspect-ratio: 4/5)');   // el mismo corte que css/halloween.css
    const REPOSO = { open: .04, light: .8, lev: 0, breath: 0 };
    const suave = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    let bruma = null;                 // base de la calabaza en el lienzo de la bruma

    /* ---------- ondas ---------- */
    /* Degradado de cada línea (solo depende del ancho): se prepara al medir */
    const medir = () => {
      const r = hero.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      /* El canvas solo cubre la franja de las ondas (de ARRIBA a abajo, ver css/halloween.css) */
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * (1 - ARRIBA) * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, -H * ARRIBA * dpr);
      const movil = W < 700, n = movil ? 23 : 38;
      trazos = [];
      /* Más luz a la derecha que a la izquierda (texto). En móvil el texto va arriba:
         las ondas pueden verse de lado a lado */
      for (let j = 0; j < n; j++) {
        const depth = j / (n - 1), g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, `rgba(145,160,180,${movil ? .1 + depth * .1 : .015})`);
        g.addColorStop(.45, `rgba(145,160,180,${movil ? .2 + depth * .16 : .13})`);
        g.addColorStop(.74, `rgba(196,200,207,${.24 + depth * .32})`);
        g.addColorStop(1, `rgba(140,156,172,${.16 + depth * .1})`);
        trazos.push(g);
      }
      /* dónde cae la base de la calabaza sobre las ondas (en px de la cabecera) */
      if (caja) {
        const c = caja.getBoundingClientRect(), b = AT.calabazaGL ? AT.calabazaGL.proyectar(BASE) : { x: .5, y: .82 };
        sombra = { x: c.left - r.left + c.width * b.x, y: c.top - r.top + c.height * b.y, w: c.width };
        if (asc) asc.medir(c.width);
        /* bruma de delante: el lienzo sobresale de la caja (ver .hw-bruma en el CSS) y basta con densidad 1 */
        if (ctxB) {
          cvB.width = Math.round(c.width * 1.9); cvB.height = Math.round(c.height * .6);
          bruma = { x: (b.x + .45) * c.width, y: (b.y - .5) * c.height };
        }
        /* murciélagos: cruzan toda la cabecera por el fondo (su lienzo va detrás de la calabaza);
           en el móvil, por debajo del texto */
        if (mur) {
          const copia = hero.querySelector('.mk-hero-copy'), finTexto = copia ? copia.getBoundingClientRect().bottom - r.top + 8 : 0;
          const movil = vertical.matches, cara = AT.calabazaGL ? AT.calabazaGL.proyectar([0, .02, .95]) : { x: .5, y: .55 };
          mur.medir(W, H, c.width, movil, { x: c.left - r.left + c.width * cara.x, y: c.top - r.top + c.height * cara.y }, movil ? finTexto : 0);
        }
      }
      medir3d();
      dibujar();
    };

    /* ---------- ondas vivas ----------
       El suelo respira con la calabaza. Al tomar aire (expresión «respira»), las líneas cercanas
       se recogen hacia ella y se apagan; al soltarlo sale un anillo de luz que levanta las líneas
       a su paso (con su seno detrás, como una ola de verdad) seguido de dos ecos más flojos, y el
       suelo queda agitado unos segundos. Al desafiar sale un anillo más suave.
       En perspectiva: lo que está más abajo en pantalla está más cerca (por eso el anillo es una elipse) */
    const PLANO = .2;                 // cuánto se aplasta en vertical el suelo visto de lado
    let tension = 0, soplo = 0, agitacion = 0, pulsos = [], armado = '', resaca = 0;
    const suelo = (seg) => {
      const ex = anim && gl3 ? anim.expresion : null;
      let tObj = 0, sObj = 0;
      if (ex && ex.tipo === 'respira') {
        tObj = suave(.02, .36, ex.x) * (1 - suave(.36, .44, ex.x));            // toma aire
        sObj = suave(.36, .44, ex.x) * (1 - suave(.6, .92, ex.x));              // lo suelta
        /* mientras toma aire, ondas que van hacia ella: el suelo se le acerca */
        if (ex.x > .04 && ex.x < .34 && (resaca -= seg) <= 0) { resaca = .42; pulsos.push({ edad: 0, fuerza: .45, dentro: true }); }
        if (armado !== ex.tipo && ex.x > .4) {
          armado = ex.tipo; agitacion = 1;
          pulsos.push({ edad: 0, fuerza: 1 }, { edad: -.45, fuerza: .5 }, { edad: -.95, fuerza: .26 });
        }
      } else if (ex && ex.tipo === 'desafio') {
        tObj = .4 * suave(0, .28, ex.x) * (1 - suave(.28, .34, ex.x));
        if (armado !== ex.tipo && ex.x > .3) { armado = ex.tipo; agitacion = Math.max(agitacion, .45); pulsos.push({ edad: 0, fuerza: .5 }); }
      } else if (!ex) armado = '';
      tension += (tObj - tension) * Math.min(1, seg * 6);
      soplo += (sObj - soplo) * Math.min(1, seg * 8);
      agitacion = Math.max(0, agitacion - seg / 4.5);
      pulsos = pulsos.filter(p => (p.edad += seg) < 3.4);
    };

    const dibujar = () => {
      ctx.clearRect(0, H * ARRIBA, W, H);
      const n = trazos.length, phase = yo.t * Math.PI * 2 / 12, e = anim ? anim.e : REPOSO, s = sombra;
      const vel = Math.max(W, H) * .34, ancho = W * .035 + 16;
      const anillos = s ? pulsos.filter(p => p.edad > 0).map(p => {
        if (p.dentro) {                                  // hacia dentro: fríos, flojos y se apagan al llegar
          const R0 = W * .5, R = R0 - p.edad * vel * .75;
          return { R: Math.max(0, R), k: R > 20 ? p.fuerza * Math.max(0, tension) * suave(0, .3, p.edad) * (R / R0) : 0, calor: 0 };
        }
        const R = p.edad * vel;
        return { R, k: p.fuerza * (1 - p.edad / 3.4) ** 1.3 / (1 + R / (W * .7)), calor: Math.max(0, 1 - R / (W * .45)) };
      }).filter(a => a.k > .005) : [];
      const L2 = (W < 700 ? W * .7 : W * .4) ** 2;        // hasta dónde llega la calabaza sobre el suelo
      const vivo = anillos.length > 0, caminos = vivo ? [] : null;
      for (let j = 0; j < n; j++) {
        const depth = j / (n - 1), base = H * (.62 + depth * .32), amp = H * (.008 + depth * .024);
        const dz = s ? (base - s.y) / PLANO : 0, dz2 = dz * dz, alza = H * (.016 + .036 * depth);
        const p = vivo ? new Path2D() : ctx;
        if (!vivo) ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const x = W * i / 100, ox = s ? x - s.x : 0;
          const cerca = s ? Math.exp(-(ox * ox + dz2) / L2) : 0;
          /* cerca de la calabaza las ondas laten con su respiración y se agitan tras el aliento */
          const a = amp * (1 + cerca * (.07 * e.breath + 1.7 * agitacion + .5 * tension));
          let y = base + Math.sin(i * .066 + depth * 4 + phase) * a + Math.sin(i * .14 - depth * 3 - phase) * a * .44;
          if (s) {
            y += (s.y - base) * .12 * tension * cerca;                          // se recogen hacia ella
            for (const r of anillos) {
              const d = Math.sqrt(ox * ox + dz2) - r.R;
              y -= (Math.exp(-(d * d) / (ancho * ancho)) - .45 * Math.exp(-((d + ancho * 1.4) ** 2) / (ancho * ancho))) * r.k * alza;
            }
          }
          if (!i) p.moveTo(x, y); else p.lineTo(x, y);
        }
        ctx.strokeStyle = trazos[j];
        ctx.lineWidth = .65 + depth * .4;
        if (vivo) { ctx.stroke(p); caminos.push(p); } else ctx.stroke();
      }
      if (!s) return;
      /* al tomar aire el suelo cercano se apaga, como si la calabaza se tragara la luz */
      if (tension > .01) {
        ctx.save();
        ctx.translate(s.x, s.y); ctx.scale(1, PLANO * 1.6);
        ctx.globalCompositeOperation = 'destination-out';
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, W * .32);
        g.addColorStop(0, `rgba(0,0,0,${(.55 * tension).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.fillRect(-W * .32, -W * .32, W * .64, W * .64);
        ctx.restore();
      }
      /* la cresta del anillo brilla: cada línea se repasa con luz justo donde la cruza
         (ámbar cerca de la calabaza, plata al alejarse) */
      if (vivo) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let j = 0; j < n; j++) {
          const depth = j / (n - 1), base = H * (.62 + depth * .32), dz = (base - s.y) / PLANO;
          const puntos = [];
          for (const r of anillos) {
            if (Math.abs(dz) >= r.R + ancho) continue;
            const hx = Math.sqrt(Math.max(0, r.R * r.R - dz * dz)), anchoX = Math.min(ancho * 3, ancho * r.R / Math.max(hx, ancho));
            const col = [255 - 35 * (1 - r.calor), 170 + 58 * (1 - r.calor), 90 + 150 * (1 - r.calor)];
            const al = Math.min(1, r.k * (.35 + .65 * depth) * (.75 + .5 * depth));   // las líneas del fondo, más suaves
            for (const x of hx < 1 ? [s.x] : [s.x - hx, s.x + hx]) puntos.push({ x, w: anchoX, col, al });
          }
          if (!puntos.length) continue;
          /* la luz de la línea es la suma de campanas suaves, muestreada: donde dos cruces se juntan
             se suman en vez de cortarse (antes salían trocitos con el borde duro) */
          const xs = [];
          for (const q of puntos) for (let k = -4; k <= 4; k++) xs.push(q.x + q.w * k / 4);
          xs.sort((a, b) => a - b);
          const g = ctx.createLinearGradient(0, 0, W, 0);
          let previo = -1;
          for (const x of xs) {
            const o = x / W;
            if (o < 0 || o > 1 || o - previo < .002) continue;
            previo = o;
            let al = 0, cr = 0, cg = 0, cb = 0;
            for (const q of puntos) {
              const u = (x - q.x) / q.w;
              if (u <= -1 || u >= 1) continue;
              const b = (1 - u * u) ** 2 * q.al;
              al += b; cr += q.col[0] * b; cg += q.col[1] * b; cb += q.col[2] * b;
            }
            g.addColorStop(o, al > 0 ? `rgba(${cr / al | 0},${cg / al | 0},${cb / al | 0},${Math.min(1, al).toFixed(3)})` : 'rgba(255,200,150,0)');
          }
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.1 + depth * .9;
          ctx.stroke(caminos[j]);
        }
        ctx.restore();
      }
      /* reflejo ámbar en las ondas cercanas (sigue a la luz interior y sube al soltar el aliento)
         y sombra suave debajo (más pequeña y clara cuanto más sube la calabaza) */
      const sube = e.lev / .02;
      ctx.save();
      ctx.translate(s.x, s.y + s.w * .03); ctx.scale(1, .17);
      ctx.globalCompositeOperation = 'source-atop';
      const luz = Math.min(1, e.light + .3 * soplo);
      let g = ctx.createRadialGradient(0, 0, 0, 0, 0, s.w * (.62 + .2 * soplo));
      g.addColorStop(0, `rgba(255,160,70,${luz.toFixed(3)})`); g.addColorStop(.45, `rgba(245,125,45,${(.5 * luz).toFixed(3)})`); g.addColorStop(1, 'rgba(240,120,40,0)');
      ctx.fillStyle = g; ctx.fillRect(-s.w, -s.w, s.w * 2, s.w * 2);
      ctx.globalCompositeOperation = 'destination-out';
      const rs = s.w * (.36 - .02 * sube);
      g = ctx.createRadialGradient(0, 0, 0, 0, 0, rs);
      g.addColorStop(0, `rgba(0,0,0,${.85 - .1 * sube})`); g.addColorStop(.6, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(-rs, -rs, rs * 2, rs * 2);
      ctx.restore();
      /* niebla de detrás, alrededor de la base */
      if (nie && entrada > 0) { ctx.globalAlpha = suave(0, 1, entrada); nie.pintar(ctx, s.x, s.y, s.w, 0, e, soplo, H * ARRIBA + 4); ctx.globalAlpha = 1; }
    };

    /* niebla de delante (por encima de la parte de abajo de la calabaza) */
    const dibujarBruma = () => {
      if (!ctxB || !bruma) return;
      ctxB.clearRect(0, 0, cvB.width, cvB.height);
      if (entrada <= 0) return;
      ctxB.globalAlpha = suave(0, 1, entrada);
      nie.pintar(ctxB, bruma.x, bruma.y, sombra ? sombra.w : cvB.width / 1.9, 1, anim ? anim.e : REPOSO, soplo);
    };

    /* ---------- calabaza 3D ---------- */
    /* Resolución de la calabaza respecto a su tamaño en la página: la de la pantalla en móviles y
       pantallas de alta densidad (hasta 2x) y 1,5x en las normales, que se reduce al mostrarla y deja
       los bordes de los cortes limpios (a 2x una gráfica integrada ya no va igual de fluida).
       Si el equipo no llega, calibrar() y la calidad adaptativa la bajan */
    const escala = () => Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2);
    const medir3d = () => {
      if (!gl3) return;
      const r = caja.getBoundingClientRect(), dpr = escala();
      const lado = Math.max(64, Math.round(r.width * dpr * q));
      /* cambiar el tamaño borra el lienzo: se vuelve a pintar en el acto o la calabaza
         desaparece un instante (parpadeo) hasta el siguiente dibujo */
      if (gl3.medir(lado, lado)) { pintado = null; pintar3d(true); }
    };
    /* El shader solo pinta la cara y la luz; la levitación, el balanceo y la respiración del
       cuerpo se hacen moviendo el lienzo con CSS (no hay que volver a pintar). Y solo se vuelve
       a pintar cuando la cara o la luz cambian algo que se note: en reposo, pocas veces por segundo */
    const R3 = { open: 0, smileL: 0, smileR: 0, squint: 0, light: 1, tilt: 0, lev: 0, breath: 0, yaw: 0, sway: 0 };
    let pintado = null;
    const cambia = (a, b) => !b || Math.abs(a.open - b.open) > .006 || Math.abs(a.smileL - b.smileL) > .006 || Math.abs(a.smileR - b.smileR) > .006
      || Math.abs(a.squint - b.squint) > .01 || Math.abs(a.tilt - b.tilt) > .0007 || Math.abs(a.light - b.light) > .006;
    let ultimo3d = 0;
    const pintar3d = (forzar, ahora) => {
      if (!gl3 || !anim) return;
      const e = anim.e;
      R3.open = e.open; R3.smileL = e.smileL; R3.smileR = e.smileR; R3.squint = e.squint; R3.light = e.light; R3.tilt = e.tilt;
      /* la cara se pinta como mucho ~30 veces por segundo (es lo caro); el movimiento del cuerpo, en cada dibujo */
      if (forzar === true || (cambia(R3, pintado) && !(ahora - ultimo3d < 1000 / 30 - 4))) {
        gl3.pintar(R3); pintado = Object.assign({}, R3); ultimo3d = ahora || 0;
      }
    };
    /* levitación, balanceo y respiración del cuerpo: a la foto y al 3D por igual */
    const altoCaja = () => (cv3 || foto).clientHeight;
    const mover = () => {
      if (!anim || !(cv3 || foto)) return;
      const e = anim.e, k = altoCaja() * 1.866 / 4.6;      // píxeles por unidad de la escena a la distancia de la calabaza
      const tr = `translate3d(0,${(-e.lev * k).toFixed(2)}px,0) rotate(${e.sway.toFixed(4)}rad) scale(${(1 + .006 * e.breath).toFixed(4)})`;
      if (cv3) cv3.style.transform = tr;
      if (foto) foto.style.transform = tr;
    };

    /* Mide lo que tarda este equipo: unos fotogramas pequeños con finish() y se calcula
       la resolución que cabe en ~9 ms por dibujo (a 30 por segundo sobra tiempo para la web) */
    const calibrar = () => {
      if (forzada) return forzada;
      const t = (lado) => { gl3.medir(lado, lado); gl3.pintar(R3); gl3.gl.finish(); const a = performance.now(); gl3.pintar(R3); gl3.pintar(R3); gl3.gl.finish(); return (performance.now() - a) / 2; };
      t(96);                                              // calentar
      const ms = t(160), porPx = ms / (160 * 160);
      const r = caja.getBoundingClientRect(), dpr = escala();
      const cabe = Math.sqrt(9 / Math.max(porPx, 1e-7)) / (r.width * dpr);
      return Math.min(1, cabe);
    };

    const cargar3d = async () => {
      if (gl3 || cargando || sinGL || !AT.calabazaGL || !anim) return;
      cargando = true;
      try { gl3 = await AT.calabazaGL.crear(cv3, undefined, { software }); } catch (e) { gl3 = null; }
      cargando = false;
      if (!vivo) { if (gl3) gl3.soltar(); gl3 = null; return; }
      if (!gl3) { sinGL = true; return; }
      q = qTope = calibrar();
      if (q < .4) { gl3.soltar(); gl3 = null; sinGL = true; return; }   // equipo muy justo: foto quieta
      cv3.addEventListener('webglcontextlost', (ev) => { ev.preventDefault(); gl3 = null; sinGL = true; caja.classList.remove('hw-3d-on'); }, { signal: AT.pagina.signal });
      medir3d();
      requestAnimationFrame(() => caja.classList.add('hw-3d-on'));                    // fundido foto → 3D
      sync();
    };
    /* La escena espera a que la página termine de cargar y el navegador quede libre:
       el texto y los botones salen al momento, mientras tanto se ve la foto */
    /* La niebla no aparece de golpe: entra poco a poco (2,5 s) en cuanto están hechos sus jirones */
    let nieLista = false, entrada = 0;
    const prepararNiebla = () => { if (nie && !nieLista) { nie.preparar(); nieLista = true; } };
    const empezar = () => (window.requestIdleCallback || (f => setTimeout(f, 200)))(() => { if (!parado) { prepararNiebla(); cargar3d(); } }, { timeout: 1500 });

    /* ---------- bucle ---------- */
    /* ~60 dibujos por segundo (a 30 el movimiento se ve a saltos); el margen de 4 ms evita
       saltarse uno por redondeos. En pantallas de 120-144 Hz sale un dibujo de cada dos */
    const bucle = (ahora) => {
      raf = 0;
      if (parado || !visible || document.hidden) return;
      if (!antes) antes = ahora;
      const dt = ahora - antes;
      if (dt >= 1000 / 60 - 4) {
        yo.t = (yo.t + dt / 1000) % 12; antes = ahora;
        /* el cuerpo flota desde el primer momento (también la foto, con el mismo movimiento), así el paso
           de la foto al 3D no se nota; las caras esperan a que se vea el 3D */
        if (anim) { anim.quieta = !(gl3 && caja.classList.contains('hw-3d-on')); anim.avanzar(dt / 1000); }
        if (nieLista) entrada = Math.min(1, entrada + dt / 2500);
        const seg = Math.min(dt / 1000, .1);
        suelo(seg);
        if (nie) nie.paso(seg);
        dibujar(); pintar3d(false, ahora); mover(); dibujarBruma();
        const e = anim ? anim.e : REPOSO;
        if (asc) asc.paso(seg, e, anim ? -e.lev * altoCaja() * 1.866 / 4.6 : 0, soplo);
        if (mur) mur.paso(seg);
        /* si el equipo no llega, baja la resolución de la calabaza (nunca de .4: no se cambia por la foto
           quieta, que se notaría); y cuando lleva un rato yendo bien la vuelve a subir. Si al subirla vuelve
           a ir lento enseguida, espera el doble antes de intentarlo otra vez (hasta 1 minuto) */
        if (gl3 && !forzada) {
          lentos = dt > 55 ? lentos + 1 : Math.max(0, lentos - 1);
          bien = dt > 40 ? 0 : bien + dt;
          if (lentos > 12) {
            lentos = 0; bien = 0;
            if (ahora - subida < 10000) espera = Math.min(espera * 2, 60000);
            if (q > .4) { q = Math.max(.4, q * .8); medir3d(); }
          } else if (q < qTope && bien > espera) {
            bien = 0; subida = ahora; q = Math.min(qTope, q / .8); medir3d();
          }
        }
      }
      raf = requestAnimationFrame(bucle);
    };

    const sync = () => {
      cancelAnimationFrame(raf); raf = 0; antes = 0; lentos = 0; bien = 0;
      hero.classList.toggle('hw-quieto', parado || !visible || document.hidden);
      if (btn) {
        btn.setAttribute('aria-pressed', String(parado));
        btn.setAttribute('aria-label', parado ? AT.t('Activar el movimiento del fondo', 'Play the background animation') : AT.t('Pausar el movimiento del fondo', 'Pause the background animation'));
      }
      if (!parado && visible && !document.hidden) { raf = requestAnimationFrame(bucle); if (!gl3 && document.readyState === 'complete') { prepararNiebla(); cargar3d(); } }
    };

    if (btn) {
      btn.hidden = false;
      btn.addEventListener('click', () => {
        parado = !parado;
        parado ? AT.store.set(this.KEY, 'parado') : AT.store.del(this.KEY);
        sync();
      }, { signal: AT.pagina.signal });
    }
    const ro = 'ResizeObserver' in window ? new ResizeObserver(medir) : null;
    if (ro) ro.observe(hero); else addEventListener('resize', medir, { signal: AT.pagina.signal });
    const io = 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }) : null;
    if (io) io.observe(hero);
    document.addEventListener('visibilitychange', sync, { signal: AT.pagina.signal });
    motion.addEventListener?.('change', () => { parado = motion.matches; sync(); }, { signal: AT.pagina.signal });
    AT.alSalir(() => {
      vivo = false; cancelAnimationFrame(raf); raf = 0; ro && ro.disconnect(); io && io.disconnect();
      if (gl3) { gl3.soltar(); gl3 = null; }
    });

    medir();
    sync();
    if (foto && !foto.complete) foto.addEventListener('load', medir, { once: true, signal: AT.pagina.signal });
    document.readyState === 'complete' ? empezar() : addEventListener('load', empezar, { once: true, signal: AT.pagina.signal });
  }
};
