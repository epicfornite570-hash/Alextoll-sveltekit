/* =========================================================
   Fondo de Halloween (portada): AMBIENTE
   ---------------------------------------------------------
   - Ascuas: chispas pequeñas y vivas con una estela corta, más alguna brasa
     grande y lenta, que salen de la boca, los ojos y alrededor del tallo, suben con un vaivén,
     se enfrían (amarillo → naranja → rojo) y se apagan. Cuando la calabaza
     respira echa una bocanada de chispas por la boca.
   - Murciélagos: de vez en cuando cruzan rápido por el fondo, por detrás de
     la calabaza: uno o dos grandes, o una bandada lejana y desenfocada.
     Cada uno tiene esqueleto en 3D (alas que bajan extendidas y suben
     plegadas, dedos, membrana festoneada, orejas, pelo) con luz de luna
     y la brasa de la calabaza traspasando la membrana.
   - Niebla: jirones que rodean la calabaza por detrás y por delante, se
     mueven despacio, se tiñen de ámbar cerca de ella y se apartan cuando
     respira.
   Canvas 2D y barato: todo lo caro (puntos con halo, jirones de niebla) se
   pinta una vez y luego solo se copia. Solo avanzan con el tiempo que les
   pasa halloween.js, así que con la pausa se quedan quietos. El azar lleva
   semilla: la secuencia no es mecánica pero sí repetible.

   AT.halloweenAmbiente.ascuas(canvas)      → { medir(lado), paso(dt, estado, despY, soplo) }
   AT.halloweenAmbiente.murcielagos(canvas) → { medir(ancho, alto, lado, movil, cara, finTexto), paso(dt) }
   AT.halloweenAmbiente.niebla()            → { pintar(ctx, cx, cy, lado, capa, estado, soplo), paso(dt) }
   AT.halloweenAmbiente.murcielago(ctx, o)  → pinta uno (lo usa el banco de pruebas)
   (las dos primeras dan null si no hay Canvas 2D)
   ========================================================= */
window.AT = window.AT || {};

AT.halloweenAmbiente = (() => {
  const TAU = Math.PI * 2;
  const azar = (semilla) => () => { semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0; let t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const suave = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  /* ---------- ascuas ---------- */
  /* El lienzo de las ascuas sobresale de la caja de la calabaza (ver css/halloween.css):
     un 10 % por cada lado y un 35 % por arriba, para que puedan subir por encima del tallo */
  const FUERA_X = .1, FUERA_Y = .35;
  /* Colores al enfriarse; cada uno es un punto con halo ya pintado */
  const COLORES = [[255, 236, 190], [255, 200, 112], [255, 158, 64], [248, 116, 36], [214, 76, 22], [160, 42, 12]];

  function ascuas(cv) {
    const ctx = cv.getContext && cv.getContext('2d');
    if (!ctx || !AT.calabazaGL) return null;
    const r = azar(7), lista = [];
    let lado = 1, dpr = 1, acum = 0, boca = [], ojos = [], arriba = [], soploAntes = 0;
    const sprites = COLORES.map(([R, G, B]) => {
      const s = lienzo(48, 48), c = s.getContext('2d'), g = c.createRadialGradient(24, 24, 0, 24, 24, 24);
      g.addColorStop(0, `rgba(${R},${G},${B},1)`); g.addColorStop(.09, `rgba(${R},${G},${B},.95)`);
      g.addColorStop(.22, `rgba(${R},${G},${B},.3)`); g.addColorStop(.55, `rgba(${R},${G},${B},.06)`); g.addColorStop(1, `rgba(${R},${G},${B},0)`);
      c.fillStyle = g; c.fillRect(0, 0, 48, 48);
      return s;
    });
    /* Por dónde salen: a lo largo de la boca y en los dos ojos (puntos de la calabaza
       llevados a la pantalla con la misma cámara que el shader) */
    const PB = [], PO = [];
    for (let i = 0; i <= 8; i++) {
      const x = -.4 + .1 * i, y = -.215 + .87 * x * x;
      PB.push([x, y, .97 * Math.sqrt(Math.max(0, 1 - x * x - (y / .74) ** 2))]);
    }
    for (const x of [-.38, .38]) for (const dx of [-.07, 0, .07]) PO.push([x + dx, .19, .88]);
    /* y por arriba, alrededor del tallo, por donde se escapa el aire caliente (sobre el negro se ven más) */
    const PA = [];
    for (let i = 0; i < 7; i++) { const a = -1.1 + i * .37; PA.push([.32 * Math.sin(a), .6, .32 * Math.cos(a)]); }

    const medir = (l) => {
      lado = Math.max(1, l);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(lado * (1 + 2 * FUERA_X) * dpr); cv.height = Math.round(lado * (1 + FUERA_Y) * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const a = (p) => { const s = AT.calabazaGL.proyectar(p); return { x: (s.x + FUERA_X) * lado, y: (s.y + FUERA_Y) * lado }; };
      boca = PB.map(a); ojos = PO.map(a); arriba = PA.map(a);
    };

    /* chispa: pequeña, rápida al salir, con estela; brasa: grande, lenta y tenue */
    const nacer = (despY, fuerza) => {
      const z = r(), de = fuerza > .3 ? (z < .85 ? boca : ojos) : z < .5 ? boca : z < .68 ? ojos : arriba;   // al soplar, casi todas por la boca
      const s = de[r() * de.length | 0];
      const brasa = r() < .2;
      const empuje = (brasa ? .5 : 1) * (1 + fuerza * 1.4);
      /* al soltar el aliento las de la boca salen en abanico, hacia los lados, y se escapan de la cara */
      const abanico = de === boca ? Math.sign(s.x - lado * (.5 + FUERA_X)) * (.1 + r() * .18) * fuerza * lado : 0;
      lista.push({
        x: s.x + (r() - .5) * .03 * lado, y: s.y + despY + (r() - .5) * .012 * lado, brasa,
        vx: (r() - .5) * (.05 + .1 * fuerza) * lado + abanico, vy: -(.09 + r() * .08) * lado * empuje,
        edad: 0, vida: brasa ? 3.6 + r() * 2.4 : 2 + r() * 1.8,
        tam: (brasa ? .006 + r() * .004 : .0026 + r() * .0024) * lado,
        fase: r() * TAU, frec: 1.2 + r() * 1.8, amp: (.008 + r() * .016) * lado, px: 0, py: 0
      });
    };

    const paso = (dt, e, despY, soplo) => {
      /* pocas en reposo; más cuanto más luz hay dentro o más se abre la boca, y una
         bocanada justo cuando la calabaza suelta el aliento */
      const ritmo = Math.min(10, 2.2 + 8 * Math.max(0, e.light - .8) + 3 * e.open + 10 * soplo);
      acum += dt * ritmo;
      if (soplo > .6 && soploAntes <= .6) acum += 9;
      soploAntes = soplo;
      while (acum >= 1 && lista.length < 60) { acum -= 1; nacer(despY, soplo); }
      if (acum > 1) acum = 1;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = 'lighter';
      const ancho = lado * (1 + 2 * FUERA_X);
      for (let i = lista.length - 1; i >= 0; i--) {
        const a = lista[i];
        a.edad += dt;
        const x = a.edad / a.vida;
        if (x >= 1) { lista.splice(i, 1); continue; }
        a.px = a.x; a.py = a.y;
        a.vy -= (a.brasa ? .012 : .03) * lado * dt;  // el aire caliente las empuja hacia arriba
        a.vx *= 1 - .9 * dt; a.vy *= 1 - .5 * dt;    // y el aire las frena
        a.x += (a.vx + a.amp * a.frec * Math.cos(a.fase + a.frec * a.edad)) * dt;
        a.y += a.vy * dt;
        const vivo = .9 + .1 * Math.sin(a.edad * 11 + a.fase);   // tiembla un poco (sin parpadear)
        const borde = Math.min(a.x, ancho - a.x, a.y) / (.05 * lado);          // se apagan antes de llegar al borde del lienzo
        const alfa = suave(0, .05, x) * Math.pow(1 - x, a.brasa ? 1.2 : 1.6) * vivo * (a.brasa ? .55 : 1) * Math.min(1, Math.max(0, borde));
        if (alfa < .01) continue;
        const col = Math.min(5, x * 6 | 0), t = a.tam * (1 - .4 * x) * 9;
        /* estela: la chispa se estira en la dirección en la que va (más al salir, que va rápida) */
        if (!a.brasa && dt > 0) {
          const vx = (a.x - a.px) / dt, vy = (a.y - a.py) / dt, v = Math.hypot(vx, vy), largo = Math.min(.05 * lado, v * .045);
          if (largo > t * .25) {
            ctx.globalAlpha = alfa * .55;
            ctx.strokeStyle = `rgb(${COLORES[col].join(',')})`; ctx.lineWidth = a.tam * 1.1; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x - vx / v * largo, a.y - vy / v * largo); ctx.stroke();
          }
        }
        ctx.globalAlpha = alfa;
        ctx.drawImage(sprites[col], a.x - t, a.y - t, t * 2, t * 2);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    };
    return { medir, paso };
  }

  /* ---------- murciélagos ---------- */
  /* Cada murciélago tiene un esqueleto en 3D que se proyecta al lienzo: brazo, antebrazo y
     cuatro dedos por ala, con la membrana tendida entre ellos y festoneada entre las puntas,
     cuerpo con pelo, orejas, patas y la membrana de la cola. Al aletear, las alas bajan
     extendidas y suben plegadas, la mano va con retraso y la perspectiva las acorta.
     La luz: un poco de luna fría por arriba y la brasa de la calabaza, que traspasa la membrana
     (los huesos se ven oscuros sobre ella) cuando pasan cerca.
     Coordenadas del murciélago: x a su derecha, y arriba, z hacia delante; envergadura ≈ 1 */
  const RAD = Math.PI / 180;
  /* largo de cada hueso y su ángulo con el ala extendida y recogida (grados, desde «hacia fuera»
     hacia «hacia delante», en el plano del ala) */
  const ALA = { brazo: [.1, -28, -58], ante: [.165, 16, 74], d2: [.13, 10, -92], d3: [.25, -9, -108], d4: [.205, -47, -122], d5: [.17, -80, -138] };
  const mas = (p, l, a) => [p[0] + l * Math.cos(a), p[1] + l * Math.sin(a)];
  /* curva cuadrática muestreada (para los festones del borde de la membrana) */
  const festo = (a, b, hacia, fondo, n, out) => {
    const c = [(a[0] + b[0]) / 2 + (hacia[0] - (a[0] + b[0]) / 2) * fondo, (a[1] + b[1]) / 2 + (hacia[1] - (a[1] + b[1]) / 2) * fondo];
    for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]); }
  };
  /* el ala derecha en su plano (u hacia fuera, v hacia delante) con el pliegue f (0 extendida) */
  const alaPlana = (f) => {
    const a = (k) => (ALA[k][1] + (ALA[k][2] - ALA[k][1]) * f) * RAD;
    const S = [.02, .04], E = mas(S, ALA.brazo[0], a('brazo')), M = mas(E, ALA.ante[0], a('ante'));
    const [T2, T3, T4, T5] = ['d2', 'd3', 'd4', 'd5'].map(k => mas(M, ALA[k][0], a(k)));
    const P = [.04, -.14];                                 // el tobillo: la membrana llega hasta la pata
    const pulgar = mas(M, .034, a('ante') + 42 * RAD);
    /* la membrana entera: del cuerpo a la muñeca por delante, la punta, y festoneada por detrás
       entre los dedos hasta la pata */
    const membrana = [[.015, .06], [M[0] * .55, M[1] * .55 + .062], M, T2, T3];
    festo(T3, T4, M, .2, 5, membrana); festo(T4, T5, M, .2, 5, membrana); festo(T5, P, M, .18, 6, membrana);
    membrana.push([.032, -.06], [.032, .01]);
    return { S, E, M, T: [T2, T3, T4, T5], pulgar, membrana, borde: [[.015, .06], [M[0] * .55, M[1] * .55 + .062], M, T2, T3] };
  };

  /* Pinta un murciélago. o: { x, y (centro en px), env (envergadura en px), fase (aleteo, rad),
     dx, dy (hacia dónde va en pantalla), fondo (-1 viene hacia ti … 1 se aleja: cuánto va hacia el
     fondo; casi nunca 0, porque de lado las alas apenas se ven), vista (0 a su altura … 1 desde
     arriba), giro (alabeo, rad), luz: {x, y, r} brasa de la calabaza o null, alfa, ojos } */
  const murcielago = (ctx, o) => {
    const s = o.env, fi = o.fase;
    /* aleteo: arriba en fase 0, abajo en π; al subir (π…2π) el ala se pliega y la mano va detrás */
    const th = (12 + 58 * Math.cos(fi)) * RAD, retraso = 24 * Math.sin(fi) * RAD;
    const pliegue = .62 * Math.max(0, -Math.sin(fi)), sube = -.024 * Math.cos(fi);
    const ala = alaPlana(pliegue);
    /* ejes del murciélago vistos desde la cámara (x derecha, y abajo, z hacia el fondo) */
    const n = Math.hypot(o.dx, o.dy) || 1, ep = (o.fondo ?? .6) * 62 * RAD;
    const F = [o.dx / n * Math.cos(ep), o.dy / n * Math.cos(ep), Math.sin(ep)];
    const b = (o.vista ?? .25) * 70 * RAD;
    let U = [0, -Math.cos(b), -Math.sin(b)];
    const uf = U[0] * F[0] + U[1] * F[1] + U[2] * F[2];
    U = U.map((v, i) => v - uf * F[i]); const un = Math.hypot(...U); U = U.map(v => v / un);
    let R = [U[1] * F[2] - U[2] * F[1], U[2] * F[0] - U[0] * F[2], U[0] * F[1] - U[1] * F[0]];
    const cg = Math.cos(o.giro || 0), sg = Math.sin(o.giro || 0);
    [R, U] = [R.map((v, i) => v * cg + U[i] * sg), U.map((v, i) => v * cg - R[i] * sg)];
    const D = 3.2;
    const P3 = (x, y, z) => {
      const cx = x * R[0] + y * U[0] + z * F[0], cy = x * R[1] + y * U[1] + z * F[1], cz = x * R[2] + y * U[2] + z * F[2];
      const k = D / (D + cz);
      return [o.x + cx * k * s, o.y + cy * k * s, cz];
    };
    /* un punto del plano del ala (lado k = 1 derecha, -1 izquierda) al espacio: el brazo gira con el
       hombro y la mano un poco más tarde; junto al cuerpo la membrana casi no se mueve */
    const angulo = (u) => th * suave(.03, .1, u) + retraso * suave(.2, .5, u);
    const enAla = (p, k) => { const a = angulo(p[0]); return P3(k * p[0] * Math.cos(a), p[0] * Math.sin(a) + sube, p[1]); };
    const camino = (lista) => { const pa = new Path2D(); lista.forEach((q, i) => i ? pa.lineTo(q[0], q[1]) : pa.moveTo(q[0], q[1])); pa.closePath(); return pa; };
    /* luz: la luna (arriba, algo a la izquierda y por delante) y la brasa; la membrana es fina,
       así que le llega por las dos caras */
    const LUNA = [-.35, -.82, -.45];
    const aBrasa = o.luz ? Math.max(0, 1 - Math.hypot(o.x - o.luz.x, (o.y - o.luz.y) * 1.25) / o.luz.r) : 0;
    const hb = o.luz ? (() => { const v = [o.luz.x - o.x, o.luz.y - o.y, -.6 * o.luz.r], m = Math.hypot(...v); return v.map(c => c / m); })() : [0, 0, 0];
    const tono = (nx, ny, nz, base, kb = 1) => {
      const N = [nx * R[0] + ny * U[0] + nz * F[0], nx * R[1] + ny * U[1] + nz * F[1], nx * R[2] + ny * U[2] + nz * F[2]];
      const brasa = kb * aBrasa * (.45 + .55 * Math.abs(N[0] * hb[0] + N[1] * hb[1] + N[2] * hb[2]));
      const luna = Math.abs(N[0] * LUNA[0] + N[1] * LUNA[1] + N[2] * LUNA[2]) / 1.02 * (1 - .75 * brasa);   // la brasa manda sobre la luna
      return [base[0] + 52 * luna + 190 * brasa, base[1] + 56 * luna + 58 * brasa, base[2] + 66 * luna + 8 * brasa].map(v => Math.min(255, v) | 0);
    };
    const MEMBRANA = [16, 12, 13], PELO = [22, 16, 14];
    ctx.save();
    ctx.globalAlpha = o.alfa ?? 1;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    /* primero el ala que queda más lejos */
    const lados = [1, -1].map(k => ({ k, z: enAla(ala.T[1], k)[2] })).sort((a, c) => c.z - a.z);
    const pintarAla = (k) => {
      /* la membrana va curvada: el tono pasa poco a poco del de junto al cuerpo (gira con el brazo)
         al de la punta (gira con la mano), y junto al cuerpo es más gruesa y oscura */
      const a1 = th * k, a2 = (th + retraso) * k;
      const c1 = tono(-Math.sin(a1), Math.cos(a1), 0, MEMBRANA), c2 = tono(-Math.sin(a2), Math.cos(a2), 0, MEMBRANA);
      const M = enAla(ala.M, k), E = enAla(ala.E, k), S = enAla(ala.S, k), T3 = enAla(ala.T[1], k);
      const g = ctx.createLinearGradient(S[0], S[1], T3[0], T3[1]);
      g.addColorStop(0, `rgba(${c1.map(v => v * .7 | 0)},.97)`); g.addColorStop(.35, `rgba(${c1},.95)`); g.addColorStop(1, `rgba(${c2},.92)`);
      ctx.fillStyle = g;
      ctx.fill(camino(ala.membrana.map(p => enAla(p, k))));
      /* huesos: más oscuros que la membrana (se notan cuando la luz la traspasa) */
      ctx.strokeStyle = `rgba(8,6,7,${(.55 + .4 * aBrasa).toFixed(2)})`;
      ctx.lineWidth = Math.max(.7, .011 * s);
      ctx.beginPath(); ctx.moveTo(S[0], S[1]); ctx.lineTo(E[0], E[1]); ctx.lineTo(M[0], M[1]); ctx.stroke();
      ctx.lineWidth = Math.max(.5, .0055 * s);
      ctx.beginPath();
      for (const T of ala.T) { const q = enAla(T, k); ctx.moveTo(M[0], M[1]); ctx.lineTo(q[0], q[1]); }
      ctx.stroke();
      /* el borde de delante coge la luz de la luna (o de la brasa): así se ve sobre el negro */
      const c = tono(0, 1, 0, [70, 74, 86]);
      ctx.strokeStyle = `rgba(${c},${(.35 + .3 * aBrasa).toFixed(2)})`;
      ctx.lineWidth = Math.max(.6, .007 * s);
      ctx.beginPath(); ala.borde.forEach((p, i) => { const q = enAla(p, k); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke();
      /* el pulgar con su uña */
      const pu = enAla(ala.pulgar, k);
      ctx.strokeStyle = `rgba(${c},.5)`; ctx.lineWidth = Math.max(.6, .008 * s);
      ctx.beginPath(); ctx.moveTo(M[0], M[1]); ctx.lineTo(pu[0], pu[1]); ctx.stroke();
    };
    pintarAla(lados[0].k);
    /* cuerpo: membrana de la cola entre las patas, patas, tronco con pelo, cabeza y orejas */
    const colaPl = []; festo([.04, -.14], [0, -.21], [0, -.12], .25, 4, colaPl); festo([0, -.21], [-.04, -.14], [0, -.12], .25, 4, colaPl);
    const colaP = [P3(.04, sube, -.14), ...colaPl.map(p => P3(p[0], sube - .01, p[1])), P3(-.03, sube, -.07), P3(.03, sube, -.07)];
    ctx.fillStyle = `rgba(${tono(0, 1, 0, MEMBRANA)},.95)`; ctx.fill(camino(colaP));
    const tronco = [], lomo = [];
    for (let i = 0; i < 20; i++) {
      const a = i / 20 * TAU, peludo = 1 + .07 * Math.sin(i * 7.3);    // el borde del pelo no es liso
      tronco.push(P3(.046 * Math.cos(a) * peludo, sube, .078 * Math.sin(a) - .005));
      lomo.push(P3(0, sube + .036 * Math.cos(a) * peludo, .078 * Math.sin(a) - .005));
    }
    const cuerpo = new Path2D();
    for (const lista of [tronco, lomo]) lista.forEach((q, i) => i ? cuerpo.lineTo(q[0], q[1]) : cuerpo.moveTo(q[0], q[1]));
    const cab = P3(0, sube + .01, .09), cabR = .03 * s * D / (D + cab[2]);
    cuerpo.moveTo(cab[0] + cabR, cab[1]); cuerpo.arc(cab[0], cab[1], cabR, 0, TAU);
    for (const k of [1, -1]) {
      const o1 = P3(k * .006, sube + .03, .1), o2 = P3(k * .04, sube + .085, .088), o3 = P3(k * .032, sube + .016, .08);
      cuerpo.moveTo(o1[0], o1[1]); cuerpo.lineTo(o2[0], o2[1]); cuerpo.lineTo(o3[0], o3[1]); cuerpo.closePath();
    }
    ctx.fillStyle = `rgb(${tono(0, .6, .8, PELO, .3)})`; ctx.fill(cuerpo);     // el pelo no deja pasar la luz
    ctx.strokeStyle = `rgba(${tono(0, 1, 0, [44, 36, 33], .5)},.4)`; ctx.lineWidth = Math.max(.6, .008 * s); ctx.stroke(cuerpo);
    /* ojos: dos puntitos que reflejan la brasa */
    if (o.ojos && s > 90) {
      ctx.fillStyle = `rgba(255,178,96,${(o.ojos * (.35 + .65 * aBrasa)).toFixed(2)})`;
      for (const k of [1, -1]) { const q = P3(k * .011, sube + .018, .118); ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(.7, .0045 * s), 0, TAU); ctx.fill(); }
    }
    pintarAla(lados[1].k);
    ctx.restore();
    return aBrasa;
  };

  function murcielagos(cv) {
    const ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return null;
    const r = azar(11);
    /* los de lejos se pintan en un lienzo a un tercio de resolución y se amplían: salen suaves,
       como desenfocados al fondo */
    const capa = lienzo(1, 1), ctxL = capa.getContext('2d');
    const BAJA = 3;
    let w = 1, h = 1, dpr = 1, L = 634, techo = 0, movil = false, cara = { x: 0, y: 0 }, grupo = [], espera = 4, cuenta = 0;   // el primero, cuando la escena ya se ha asentado
    let caja = null;      // lo que se pintó en el fotograma anterior (para borrar solo eso)

    /* cara: centro de la cara de la calabaza en este lienzo (de ahí sale la luz de la brasa);
       finTexto: en el móvil, dónde acaba el texto (los murciélagos van por debajo) */
    const medir = (ancho, alto, lado, esMovil, c, finTexto = 0) => {
      w = Math.max(1, ancho); h = Math.max(1, alto); L = lado; movil = esMovil; cara = c; techo = Math.max(0, finTexto);
      /* son oscuros y van rápido: no hace falta mucha resolución (y en pantallas grandes, menos) */
      dpr = Math.min(window.devicePixelRatio || 1, 1.25, Math.sqrt(4e6 / (w * h)));
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      capa.width = Math.ceil(w / BAJA); capa.height = Math.ceil(h / BAJA);
      ctxL.setTransform(1 / BAJA, 0, 0, 1 / BAJA, 0, 0);
      caja = null;
    };

    /* Grupos (se turnan):
       grande  → uno o dos murciélagos grandes cruzan rápido toda la cabecera a media altura,
                 por detrás de la calabaza (la calabaza los tapa al pasar)
       bandada → cuatro a siete más pequeños y lejanos cruzan por arriba, desenfocados
       Vuelan con quiebros: cambios de rumbo cortos y bruscos, como los de verdad */
    const nuevoGrupo = () => {
      cuenta++;
      const tipo = cuenta % 2 ? 'grande' : 'bandada', izq = r() < .5;
      const env0 = tipo === 'grande' ? (movil ? w * .55 : Math.min(800, Math.max(320, w * .32))) : (movil ? w * .2 : Math.min(200, Math.max(90, w * .075)));
      const n = tipo === 'grande' ? (r() < .65 ? 1 : 2) : 4 + (r() * 4 | 0);
      const dur = tipo === 'grande' ? (movil ? 1 : 1.15) + r() * .35 : (movil ? 1.4 : 1.7) + r() * .5;
      /* a qué altura va por la derecha (yD) y por la izquierda (yI) de la cabecera.
         En el ordenador los grandes se turnan: entran por encima de la calabaza y bajan por detrás
         de ella, o suben desde detrás; sin acercarse al menú. En el móvil, entre el texto y el tallo */
      const alto = (cuenta >> 1) % 2 === 0, techoG = 70 + env0 * .3;
      const altura = (i) => {
        const v = i ? (r() - .5) * .12 * h : 0;
        if (movil) {
          const y0 = techo + env0 * .46, y1 = Math.max(y0, Math.min(cara.y, y0 + L * .22));
          return [lerp(y0, y1, r()), lerp(y0, y1, r())];
        }
        if (tipo === 'bandada') { const y = h * (.14 + r() * .1) + v; return [y, y + (r() - .5) * .14 * h]; }
        return alto ? [Math.max(techoG, h * (.17 + r() * .06)) + v, h * (.4 + r() * .1) + v] : [h * (.42 + r() * .1) + v, Math.max(techoG, h * (.24 + r() * .08)) + v];
      };
      grupo = [];
      /* unos se alejan hacia el fondo y otros vienen hacia ti (de lado las alas apenas se verían) */
      const hacia = r() < .6 ? 1 : -1;
      for (let i = 0; i < n; i++) {
        const env = env0 * (i ? .7 + r() * .3 : .92 + r() * .16);
        const [yD, yI] = altura(i), y0 = izq ? yI : yD, y1 = izq ? yD : yI;
        const x0 = -env * .7, x1 = w + env * .7;
        grupo.push({
          tipo, lejos: tipo === 'bandada', env, edad: 0, retraso: i ? (tipo === 'grande' ? .28 + r() * .3 : i * (.07 + r() * .12)) : 0,
          dur: dur * (.9 + r() * .2), p0: [izq ? x0 : x1, y0], p1: [izq ? x1 : x0, y1],
          arco: (r() - .5) * .16 * h, fondo: hacia * (.5 + r() * .35), s0: 1 + hacia * .12, s1: 1 - hacia * .12,
          fase: r() * TAU, frec: (tipo === 'grande' ? 5.6 : 8.2) + r() * 1.4, vista: .12 + r() * .3,
          ph1: r() * TAU, ph2: r() * TAU, quiebro: { u: .25 + r() * .5, a: (r() - .5) * .3 }
        });
      }
    };

    /* dónde está a una edad dada (posición y escala) */
    const sitio = (m, edad) => {
      const u = (edad - m.retraso) / m.dur;
      const x = lerp(m.p0[0], m.p1[0], u);
      let y = lerp(m.p0[1], m.p1[1], u) + m.arco * Math.sin(Math.PI * u);
      y += m.env * (.06 * Math.sin(TAU * 1.4 * edad + m.ph1) + .03 * Math.sin(TAU * 3.1 * edad + m.ph2));
      y += m.env * m.quiebro.a * suave(m.quiebro.u, m.quiebro.u + .08, u);
      return { x, y, u, s: lerp(m.s0, m.s1, u) };
    };

    const pintarUno = (c, m, edad, alfa) => {
      const p = sitio(m, edad), q = sitio(m, edad + .02);
      const giro = Math.max(-.6, Math.min(.6, (q.y - p.y) / (Math.abs(q.x - p.x) + 1e-3) * .9)) * Math.sign(q.x - p.x || 1);
      const env = m.env * p.s;
      let a = alfa * suave(-.02, .06, p.u) * (1 - suave(.94, 1.02, p.u));
      if (m.lejos) a *= .8;
      if (!movil) a *= .3 + .7 * suave(w * .18, w * .5, p.x);   // detrás del texto se pierden en lo oscuro
      murcielago(c, {
        x: p.x, y: p.y, env, fase: m.fase + TAU * m.frec * edad, dx: q.x - p.x, dy: q.y - p.y,
        fondo: m.fondo, vista: m.vista, giro, alfa: a, ojos: m.lejos ? 0 : 1,
        luz: m.lejos ? null : { x: cara.x, y: cara.y, r: L * .95 }    // a los de lejos no les llega la brasa
      });
      return [p.x - env * .62, p.y - env * .62, p.x + env * .62, p.y + env * .62];
    };

    const paso = (dt) => {
      const borrar = (c, b, k = 1) => { if (b) c.clearRect(b[0] - 4 * k, b[1] - 4 * k, b[2] - b[0] + 8 * k, b[3] - b[1] + 8 * k); };
      if (!grupo.length) {
        if (caja) { ctx.clearRect(0, 0, w, h); caja = null; }
        espera -= dt;
        if (espera > 0) return;
        nuevoGrupo();
      }
      /* se borra solo la zona donde se pintó la vez anterior */
      if (caja) { borrar(ctx, caja.c); borrar(ctxL, caja.l); }
      const cajaC = [1e9, 1e9, -1e9, -1e9], cajaL = [1e9, 1e9, -1e9, -1e9];
      const crecer = (b, q) => { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[2]); b[3] = Math.max(b[3], q[3]); };
      for (let i = grupo.length - 1; i >= 0; i--) {
        const m = grupo[i];
        m.edad += dt;
        const u = (m.edad - m.retraso) / m.dur;
        if (u >= 1.02) { grupo.splice(i, 1); continue; }
        if (u < -.02) continue;
        if (m.lejos) { crecer(cajaL, pintarUno(ctxL, m, m.edad, 1)); continue; }
        /* los grandes van rápido: una copia tenue un instante antes, como el rastro que deja el ojo */
        crecer(cajaC, pintarUno(ctx, m, m.edad - .009, .2));
        crecer(cajaC, pintarUno(ctx, m, m.edad, 1));
      }
      if (cajaL[2] > cajaL[0]) {
        const x0 = Math.max(0, cajaL[0] / BAJA - 2 | 0), y0 = Math.max(0, cajaL[1] / BAJA - 2 | 0);
        const x1 = Math.min(capa.width, Math.ceil(cajaL[2] / BAJA) + 2), y1 = Math.min(capa.height, Math.ceil(cajaL[3] / BAJA) + 2);
        if (x1 > x0 && y1 > y0) {
          ctx.save(); ctx.globalCompositeOperation = 'destination-over';   // por detrás de los grandes
          ctx.drawImage(capa, x0, y0, x1 - x0, y1 - y0, x0 * BAJA, y0 * BAJA, (x1 - x0) * BAJA, (y1 - y0) * BAJA);
          ctx.restore();
          crecer(cajaC, [x0 * BAJA, y0 * BAJA, x1 * BAJA, y1 * BAJA]);
        }
      }
      caja = { c: cajaC[2] > cajaC[0] ? cajaC : null, l: cajaL[2] > cajaL[0] ? cajaL : null };
      if (!grupo.length) espera = 3.2 + r() * 3;
    };
    return { medir, paso };
  }

  /* ---------- niebla ---------- */
  /* Jirones: ruido suave (fbm) con los bordes deshilachados, pintados una vez en dos tonos.
     Se dibujan alrededor de la base de la calabaza en dos capas: detrás (en el lienzo de las
     ondas) y delante (en el lienzo de la bruma) */
  function niebla() {
    const r = azar(5);
    const ruido = (sem) => {
      const v = new Float32Array(64 * 64), q = azar(sem);
      for (let i = 0; i < v.length; i++) v[i] = q();
      return (x, y) => {
        const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
        const g = (a, b) => v[((b & 63) << 6) | (a & 63)];
        return lerp(lerp(g(xi, yi), g(xi + 1, yi), ux), lerp(g(xi, yi + 1), g(xi + 1, yi + 1), ux), uy);
      };
    };
    /* un jirón: ruido de rasgos grandes, estirado a lo ancho, con los bordes deshilachados */
    const jiron = (sem, [R, G, B]) => {
      const W = 160, H = 64, c = lienzo(W, H), x = c.getContext('2d'), img = x.createImageData(W, H), n = ruido(sem);
      for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
        const u = i / W, v = j / H;
        let f = 0, a = .55, s = 1.7;
        for (let o = 0; o < 3; o++) { f += a * n(u * s * 2.3 + o * 7.1, v * s + o * 3.7); a *= .48; s *= 2.2; }
        const dx = (u - .5) / .5, dy = (v - .5) / .5, borde = 1 - suave(.15, 1, dx * dx + dy * dy * 1.4);
        const k = (j * W + i) * 4;
        img.data[k] = R; img.data[k + 1] = G; img.data[k + 2] = B; img.data[k + 3] = suave(.28, .78, f) * borde * 220;
      }
      x.putImageData(img, 0, 0);
      return c;
    };
    let gris = null, ambar = null;
    const preparar = () => {
      if (gris) return;
      gris = [1, 2, 3].map(s => jiron(s * 13, [150, 160, 176]));
      ambar = [1, 2, 3].map(s => jiron(s * 13, [255, 146, 64]));
    };
    /* jirones alrededor de la base: x en anchos de calabaza (de -1,5 a 1,5), altura, tamaño,
       deriva, capa (0 detrás, 1 delante) y fuerza */
    const lista = [];
    for (let i = 0; i < 13; i++) {
      const capa = i < 8 ? 0 : 1;
      lista.push({
        x: -1.5 + r() * 3, y: (r() - .5) * (capa ? .08 : .16), ancho: capa ? .8 + r() * .8 : 1.1 + r() * 1.1,
        vx: (.03 + r() * .05) * (r() < .5 ? -1 : 1), capa, alfa: capa ? .2 + r() * .16 : .16 + r() * .14,
        spr: r() * 3 | 0, ph: r() * TAU, voltea: r() < .5
      });
    }
    let t = 0;
    const paso = (dt) => {
      t += dt;
      for (const j of lista) { j.x += j.vx * dt; if (j.x > 1.5) j.x -= 3; else if (j.x < -1.5) j.x += 3; }
    };
    /* Cada capa se pinta a media resolución en su propio lienzo, se le da un borde suave en
       elipse (así nunca se ve un corte recto) y se copia al lienzo de destino.
       Zona de cada capa (en tamaños de calabaza, respecto a la base): ancho y de dónde a dónde en vertical */
    const ZONA = [{ w: 3.1, y0: -.34, y1: .3 }, { w: 1.9, y0: -.32, y1: .28 }];
    const capas = [null, null];
    /* cx, cy: base de la calabaza en el lienzo; lado: tamaño de la calabaza; tope: la y más alta
       que se puede pintar en ese lienzo. Hasta que no hay jirones (preparar()) no sale nada */
    const pintar = (ctx, cx, cy, lado, capa, e, soplo, tope = -1e9) => {
      if (!gris) return;
      const Z = ZONA[capa], K = .5;
      const arriba = Math.max(cy + Z.y0 * lado, tope), alto = cy + Z.y1 * lado - arriba, ancho = Z.w * lado;
      if (alto < 8) return;
      let b = capas[capa];
      const bw = Math.max(1, Math.round(ancho * K)), bh = Math.max(1, Math.round(alto * K));
      if (!b || b.canvas.width !== bw || b.canvas.height !== bh) { b = capas[capa] = lienzo(bw, bh).getContext('2d'); }
      b.clearRect(0, 0, bw, bh);
      const bx = bw / 2, by = (cy - arriba) * K, L = lado * K;
      for (const j of lista) {
        if (j.capa !== capa) continue;
        const x = j.x + Math.sign(j.x || 1) * .25 * soplo;               // se aparta al soltar el aliento
        const lejos = Math.abs(x);
        const w = j.ancho * L * (1 + .2 * soplo), h = w * .3;
        const px = bx + x * L * .62 - w / 2, py = by + (j.y + .03 * Math.sin(t * .45 + j.ph)) * L - h * (capa ? .45 : .62);
        /* al llegar a un lado el jirón vuelve a entrar por el otro: se apaga antes y se enciende después,
           así nunca se ve que salta (antes se notaba un corte en la niebla) */
        const fuerza = j.alfa * (1 + .45 * soplo) * (1 - suave(1.02, 1.48, Math.abs(j.x)));
        if (fuerza < .003) continue;
        const cerca = Math.max(0, 1 - lejos / .85) * Math.min(1, .45 + 1.2 * Math.max(0, e.light - .72) + .6 * soplo);
        b.save();
        if (j.voltea) { b.translate(px + w, py); b.scale(-1, 1); } else b.translate(px, py);
        b.globalAlpha = Math.min(1, fuerza * (1 - .7 * cerca)); b.drawImage(gris[j.spr], 0, 0, w, h);
        if (cerca > .02) { b.globalAlpha = Math.min(1, fuerza * cerca); b.drawImage(ambar[j.spr], 0, 0, w, h); }
        b.restore();
      }
      /* borde suave en elipse */
      b.save();
      b.globalCompositeOperation = 'destination-in';
      b.translate(bw / 2, bh / 2); b.scale(1, bh / bw);
      const g = b.createRadialGradient(0, 0, 0, 0, 0, bw / 2);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.55, 'rgba(0,0,0,.85)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      b.fillStyle = g; b.fillRect(-bw / 2, -bw / 2, bw, bw);
      b.restore();
      ctx.drawImage(b.canvas, cx - ancho / 2, arriba, ancho, alto);
    };
    return { pintar, paso, preparar };
  }

  return { ascuas, murcielagos, niebla, murcielago };   // murcielago(ctx, opciones): pinta uno (banco de pruebas)
})();
