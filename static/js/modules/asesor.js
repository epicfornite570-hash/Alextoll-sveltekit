/* =========================================================
   Asesor: ¿merece la pena mejorar el ordenador o comprar otro?
   ---------------------------------------------------------
   Reglas sencillas y honestas. Puedes ajustar los puntos y
   los textos de REGLAS sin tocar el resto.
   Puntuación de 0 a 100: cuanto más alta, más compensa mejorarlo.
   ========================================================= */
window.AT = window.AT || {};
AT.modules = AT.modules || {};

AT.modules.asesor = {
  /* Puntos que suma o resta cada respuesta */
  PUNTOS: {
    edad:  { '<3': 25, '3-6': 12, '6-10': -8, '>10': -32 },
    disco: { hdd: 12, ssd: 0, '?': 4 },  // un disco duro antiguo = mejora barata y muy notable
    ram:   { '4': -2, '8': 4, '16': 8, '?': 0 },
    uso:   { basico: 10, estudios: 6, juegos: -6, edicion: -8 },
    tipo:  { sobremesa: 6, portatil: -2 }
  },

  /* Pasos recomendados según las respuestas (en orden de prioridad) */
  pasos(r) {
    const p = [];
    if (r.disco === 'hdd') p.push('Cambiar el disco duro por un SSD. Es la mejora que más se nota: arranca en segundos.');
    if (r.disco === '?') p.push('Comprobar si tiene disco duro o SSD. Si es disco duro, pasarlo a SSD es lo primero.');
    if (r.ram === '4') p.push(r.tipo === 'portatil'
      ? 'Subir la RAM a 8 o 16 GB (en algunos portátiles va soldada: lo compruebo antes).'
      : 'Subir la RAM a 16 GB. Con 4 GB hoy casi todo va justo.');
    if (r.ram === '8' && (r.uso === 'juegos' || r.uso === 'edicion')) p.push('Pasar de 8 a 16 GB de RAM para jugar o editar con soltura.');
    if (r.ram === '?') p.push('Mirar cuánta RAM tiene (en Windows: Configuración → Sistema → Información).');
    if (r.edad !== '<3') p.push('Limpieza interna y pasta térmica nueva: menos ruido y menos calor.');
    if (r.uso === 'juegos' && r.tipo === 'sobremesa') p.push('Valorar una tarjeta gráfica que encaje con tu fuente de alimentación.');
    if (r.uso === 'juegos' && r.tipo === 'portatil') p.push('En portátil la gráfica no se cambia: si se queda corto para jugar, mejor pensar en otro equipo.');
    p.push('Reinstalar el sistema limpio, con tus archivos guardados antes, si va lleno de programas.');
    return p.slice(0, 4);
  },

  veredicto(score, r) {
    if (score >= 60) return {
      nivel: 2, titulo: 'Merece la pena mejorarlo',
      texto: 'Tu equipo tiene margen. Con un par de cambios bien elegidos va a ir mucho mejor por bastante menos de lo que cuesta uno nuevo.',
      svc: r.disco === 'hdd' || r.ram === '4' ? 'hardware' : 'optimizacion'
    };
    if (score >= 35) return {
      nivel: 1, titulo: 'Puede compensar, depende del presupuesto',
      texto: 'Una mejora le dará unos años más, pero no hará milagros. Te digo el precio de las dos opciones y decides tú.',
      svc: 'asesoria'
    };
    return {
      nivel: 0, titulo: 'Seguramente te compensa uno nuevo',
      texto: 'Por edad o por uso, gastar en este equipo puede no merecer la pena. Te ayudo a elegir el nuevo y te paso todos tus archivos.',
      svc: 'asesoria'
    };
  },

  init() {
    const form = AT.$('#advisor'), out = AT.$('#verdict');
    if (!form || !out) return;

    const update = () => {
      const fd = new FormData(form);
      const r = Object.fromEntries(['tipo', 'edad', 'ram', 'disco', 'uso'].map(k => [k, fd.get(k)]));
      const missing = Object.values(r).filter(v => !v).length;
      if (missing) {
        out.innerHTML = `
          <span class="muted">${5 - missing} de 5 respuestas</span>
          <h3>Contesta y te digo qué haría yo</h3>
          <p>Cinco preguntas rápidas sobre tu ordenador. No hace falta saber de informática: si dudas, marca «No lo sé».</p>`;
        return;
      }
      let score = 50;
      for (const k in this.PUNTOS) score += this.PUNTOS[k][r[k]] || 0;
      score = Math.max(4, Math.min(96, score));
      const v = this.veredicto(score, r), svc = AT.servicio(v.svc), pasos = this.pasos(r);
      /* Resumen legible con los textos de las opciones marcadas, para el mensaje */
      const txt = (k) => form.querySelector(`input[name="${k}"]:checked`)?.closest('label')?.textContent.trim();
      const resumen = `Es un ${txt('tipo').toLowerCase()} de ${txt('edad').toLowerCase()}, RAM: ${txt('ram')}, disco: ${txt('disco')}, lo uso para: ${txt('uso').toLowerCase()}.`;

      out.innerHTML = `
        <h3>${v.titulo}</h3>
        <div class="scale" role="img" aria-label="Veredicto: ${v.titulo}">${['Comprar otro', 'Depende', 'Mejorarlo'].map((t, n) => `<span${n === v.nivel ? ' class="on"' : ''}>${t}</span>`).join('')}</div>
        <p>${v.texto}</p>
        <ol>${pasos.map(p => `<li>${AT.esc(p)}</li>`).join('')}</ol>
        <button class="btn btn--primary" type="button" data-go>Pedir presupuesto</button>
        <p class="note">Es una orientación. Con el modelo exacto te digo precios reales.</p>`;
      AT.$('[data-go]', out).addEventListener('click', () =>
        AT.prefillContact({ servicio: svc?.name, mensaje: `Hola, he usado el asesor de la web. ${resumen} ` }));
    };

    /* En móvil el resultado está debajo de las preguntas: al contestar la última, lo enseñamos */
    let shown = false;
    form.addEventListener('change', () => {
      update();
      const done = ['tipo', 'edad', 'ram', 'disco', 'uso'].every(k => form.querySelector(`input[name="${k}"]:checked`));
      if (done && !shown && matchMedia('(max-width: 899px)').matches) { shown = true; AT.reveal(out); }
    });
    form.addEventListener('submit', e => e.preventDefault());
    update();
  }
};
