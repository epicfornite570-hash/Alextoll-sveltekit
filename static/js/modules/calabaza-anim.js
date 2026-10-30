/* =========================================================
   Calabaza 3D de Halloween (portada): ANIMACIONES
   ---------------------------------------------------------
   Reposo continuo (levitación ~1,3 % de su altura, balanceo e
   inclinación casi imperceptibles, respiración y luz que varía despacio)
   más expresiones breves separadas por pausas:
     A. sonrisa contenida    (suben las dos comisuras, la boca se abre un poco)
     B. respiración          (la parte de abajo baja despacio, sube la luz)
     C. gesto desafiante     (se inclina hacia delante, entrecierra los ojos
                              y enseña los dientes de arriba)
     D. quietud vigilante    (las pausas: solo levitación y luz)
   Todo depende del tiempo de animación t (no del reloj): al pausar se
   congela y al seguir continúa sin saltos. Cada expresión empieza y acaba
   en 0, así que nunca se acumulan transformaciones. Las pausas varían con
   un generador con semilla: la secuencia no es mecánica pero sí repetible.

   AT.calabazaAnim.crear() → { avanzar(dt), e, expresion }   (e = estado para calabaza-gl.js)
   ========================================================= */
window.AT = window.AT || {};

AT.calabazaAnim = (() => {
  const G = Math.PI / 180, TAU = Math.PI * 2;
  const suave = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * x * (x * (x * 6 - 15) + 10); };
  /* sube (a), se mantiene (h) y baja; a + h + bajada = 1 */
  const env = (x, a, h) => x <= 0 || x >= 1 ? 0 : x < a ? suave(x / a) : x < a + h ? 1 : 1 - suave((x - a - h) / (1 - a - h));
  const azar = (semilla) => () => { semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0; let t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  const EXPRESIONES = {
    sonrisa: { dur: [3.2, 4], fn(x, e) { const k = env(x, .35, .25); e.smileL += k; e.smileR += k; e.open += .2 * k; } },
    respira: { dur: [4.5, 5.8], fn(x, e) { const k = env(x, .4, .18); e.open += .85 * k; e.light += .22 * k; e.squint += .15 * k; } },
    desafio: { dur: [3.4, 4.6], fn(x, e) { const k = env(x, .3, .38); e.tilt += 3.2 * G * k; e.open += .42 * k; e.squint += .75 * k; e.smileL += .25 * k; e.smileR += .25 * k; } }
  };

  function crear(semilla = 23) {   // con esta semilla salen las tres expresiones en los primeros 24 s
    const r = azar(semilla);
    const e = { open: 0, smileL: 0, smileR: 0, squint: 0, light: 1, breath: 0, lev: 0, tilt: 0, yaw: 0, sway: 0 };
    let t = 0, ultima = '', actual = null, proxima = 4.5;   // primero, unos segundos de presencia quieta
    let quieta = false;   // mientras se ve la foto: solo el reposo (la foto no puede poner caras)

    const elegir = () => {
      const tipos = Object.keys(EXPRESIONES).filter(k => k !== ultima);
      const tipo = tipos[Math.floor(r() * tipos.length)], ex = EXPRESIONES[tipo];
      ultima = tipo;
      actual = { tipo, ex, inicio: t, dur: ex.dur[0] + r() * (ex.dur[1] - ex.dur[0]), lado: r() < .5 ? 'smileL' : 'smileR' };
    };

    const calcular = () => {
      /* reposo */
      e.lev = .02 * Math.sin(TAU * t / 6.4);
      e.sway = .45 * G * Math.sin(TAU * t / 9.7 + 1);
      e.tilt = .35 * G * Math.sin(TAU * t / 7.9 + .4);
      e.yaw = .3 * G * Math.sin(TAU * t / 12.3 + 2);
      e.breath = Math.sin(TAU * t / 5.3);
      e.light = .9 + .06 * Math.sin(TAU * t / 4.3) + .035 * Math.sin(TAU * t / 2.9 + 1.7) - .095;
      e.open = .04 + .03 * Math.sin(TAU * t / 5.3 - .6);   // casi cerrada: respira con el cuerpo
      e.smileL = e.smileR = e.squint = 0;
      /* expresión en curso */
      if (actual) {
        const x = (t - actual.inicio) / actual.dur;
        if (x >= 1) {
          actual = null;
          /* quietud vigilante: pausa variable; a veces bastante más larga */
          proxima = t + (r() < .25 ? 7 + r() * 3 : 3 + r() * 3.5);
        } else actual.ex.fn(x, e, actual.lado);
      }
      if (!actual && t >= proxima && !quieta) elegir();
    };

    calcular();
    return {
      e,
      get t() { return t; },
      /* quieta = true: no empieza ninguna expresión (al soltarla, espera al menos 2,5 s) */
      get quieta() { return quieta; },
      set quieta(v) { if (quieta && !v) proxima = Math.max(proxima, t + 2.5); quieta = !!v; },
      /* expresión en curso y cuánto lleva (0 a 1), o null en las pausas (para el ambiente) */
      get expresion() { return actual ? { tipo: actual.tipo, x: (t - actual.inicio) / actual.dur } : null; },
      avanzar(dt) { t += Math.min(dt, .1); calcular(); }   // un salto grande (pestaña dormida) no adelanta la cara
    };
  }
  return { crear };
})();
