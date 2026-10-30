/* Textos de la página de ordenadores (ordenadores.html y en/computers.html).
   Página: src/lib/paginas/Ordenadores.svelte
   PREGUNTAS: las mismas van a la página y a los datos para Google (FAQPage). */
export const TX = {
  es: {
    title: 'Alextoll | Reparación y mejora de ordenadores en Madrid',
    desc: 'Reparación de ordenadores en Madrid: limpieza, más RAM y SSD, instalación de Windows y Linux y puesta a punto. Presupuesto antes de empezar. Escríbeme y te respondo yo.',
    ogTitle: 'Alextoll: tu ordenador, como nuevo',
    ogDesc: 'Reparación y mejora de ordenadores en Madrid. Limpieza, más RAM y SSD, Windows y Linux. Presupuesto antes de tocar nada.',
    ogAlt: 'Alextoll, reparación y mejora de ordenadores',
    hero: {
      eyebrow: 'Reparación y optimización de ordenadores en Madrid', h1: '<span>Tu ordenador,</span> <span class="silver">como nuevo.</span>',
      lede: 'Diagnostico, reparo y mejoro tu ordenador para que vuelva a ir como el primer día. Te digo qué le pasa y cuánto cuesta antes de tocar nada.',
      cta: 'Pedir diagnóstico', sobreMi: 'Sobre mí', puntos: ['Diagnóstico honesto', 'Trato personal', 'Presupuesto sin compromiso'], pausa: 'Pausar el vídeo de fondo'
    },
    serv: {
      eyebrow: 'Soluciones para tu ordenador', h2: 'Servicios principales',
      nota: 'Todo lo que tu equipo necesita para volver a rendir como el primer día. Con cuidado y explicaciones claras.',
      mas: 'Más información',
      cards: [
        ['reparacion.webp', 'Reparación', 'No enciende, se bloquea o se reinicia. Busco la causa antes de cambiar nada y te explico qué tiene.', 'reparacion-ordenadores-madrid'],
        ['ssd-ram.webp', 'Mejora de SSD / RAM', 'Más velocidad y más fluidez sin cambiar de ordenador: disco SSD y memoria compatibles con tu equipo.', 'cambiar-disco-ssd-madrid'],
        ['limpieza.webp', 'Limpieza y mantenimiento', 'Fuera el polvo, pasta térmica nueva y menos temperatura. Tu equipo más silencioso y con más vida.', 'limpieza-ordenador-madrid'],
        ['sistema.webp', 'Formateo y sistema', 'Instalación limpia de Windows o Linux con tus archivos guardados antes, configurada a tu medida.', 'formatear-ordenador-madrid']
      ],
      tambien: 'También: <a href="ampliar-memoria-ram-madrid.html">ampliar la memoria RAM</a>, programas y software, puesta a punto, copias de seguridad, asesoramiento y montaje de PC por piezas. <a href="#contacto">Pregúntame</a>.',
      teaser: ['Nuevo', '¿Necesitas una web para tu negocio?', 'También diseño webs modernas para pequeños negocios y profesionales, desde 99 €.', 'Ver diseño web']
    },
    trust: {
      eyebrow: 'Confianza en cada paso', h2: 'Un servicio claro y sin sorpresas',
      txt: 'Te mantengo informado en todo momento, con un trato cercano y un proceso transparente. Si el presupuesto no te convence, no se hace nada.',
      pasos: [['lupa', 'Diagnóstico', 'Reviso tu equipo y te explico qué le pasa con palabras normales.'], ['hoja', 'Presupuesto', 'Precio cerrado antes de empezar, sin compromiso.'],
        ['llave', 'Reparación', 'Hago el trabajo con cuidado y te mantengo informado.'], ['ok', 'Entrega', 'Te enseño lo que he hecho y te doy consejos para que dure.']],
      stats: [['personas', 'Trato personal', 'Hablas siempre conmigo'], ['hoja', 'Presupuesto gratis', 'Antes de tocar nada'], ['escudo', 'Tus datos, a salvo', 'Copia antes de formatear'], ['portatil', 'Portátil y sobremesa', 'Con Windows o Linux']]
    },
    trab: {
      eyebrow: 'Resultados que hablan', h2: 'Trabajos reales', anteriores: 'Trabajos anteriores', mas: 'Más trabajos', aria: 'Trabajos realizados',
      pronto: 'Foto real próximamente', antes: 'Antes', despues: 'Después',
      items: [['Mejora de rendimiento', 'De un equipo lento a uno fluido con SSD y más RAM.'], ['Limpieza completa', 'Polvo fuera y pasta térmica nueva. Menos temperatura.'],
        ['Formateo y optimización', 'Sistema limpio, sin errores y listo para el día a día.'], ['Cambio a SSD', 'Un equipo antiguo que vuelve a arrancar en segundos.']],
      nota: 'Pronto, fotos reales de antes y después de equipos que han pasado por mis manos.'
    },
    op: { eyebrow: 'Opiniones', h2: 'Lo que dicen los clientes' },
    precios: {
      eyebrow: 'Precios orientativos', h2: 'Soluciones para cada necesidad',
      txt: 'Cada equipo es un mundo. Cuéntame tu caso y te doy un diagnóstico y un presupuesto cerrado, sin compromiso. Preguntar no cuesta nada.',
      cta: 'Pedir diagnóstico', online: 'Diagnóstico rápido online',
      tiles: [['limpieza', 'ventilador', 'Limpieza', 'Precio'], ['so', 'ventana', 'Formateo', 'Precio'], ['hardware', 'ram', 'Mejora SSD / RAM', 'Precio'], ['arreglos', 'llave', 'Reparación', 'Según avería']],
      aPresupuesto: 'A presupuesto'
    },
    faq: {
      eyebrow: 'Dudas frecuentes', h2: 'Preguntas frecuentes', otra: '¿Otra duda? Pregúntame',
      preguntas: [
        ['¿Cuánto cuesta?', 'Depende del problema y de las piezas. Te doy el precio cerrado después de ver el equipo y antes de empezar. Preguntar y pedir presupuesto no cuesta nada.'],
        ['¿Cuánto tardas?', 'Una limpieza o una instalación de sistema suelen estar en uno o dos días. Si hay que pedir piezas, depende de lo que tarde el envío. Siempre te doy una fecha aproximada.'],
        ['¿Pierdo mis archivos si formateas?', 'No, si hacemos copia antes. Te propongo guardar tus fotos, documentos y lo importante antes de reinstalar nada.'],
        ['¿Las piezas las pongo yo o las consigues tú?', 'Como prefieras. Puedo recomendarte qué comprar para que sea compatible con tu equipo, o conseguirla yo e incluirla en el presupuesto.'],
        ['¿Trabajas con portátiles y sobremesa?', 'Sí, con los dos, con Windows o Linux. Si tienes otro tipo de equipo, escríbeme y te digo si puedo ayudarte.'],
        ['No sé nada de informática, ¿me vas a entender?', 'Sí. Cuéntamelo con tus palabras: qué hace, desde cuándo y qué estabas haciendo. Con eso y una foto o un vídeo corto suelo hacerme una idea.'],
        ['¿Dónde trabajas?', 'Trabajo en Madrid, sobre todo los fines de semana. Me lo acercas o quedamos para recogerlo. Muchas cosas de programas y configuración se pueden resolver en remoto.', 'faq-zona']
      ]
    },
    cont: {
      eyebrow: 'Contacto', h2: 'Cuéntame qué le pasa a tu ordenador', nota: 'Te respondo lo antes posible con una idea de lo que tiene y el siguiente paso.',
      noRellenar: 'No rellenar', borrador: 'He recuperado lo que estabas escribiendo.', deCero: 'Empezar de cero',
      nombre: 'Nombre', contacto: 'Teléfono o email', necesitas: '¿Qué necesitas?', noSe: ['No lo sé', 'No lo sé, que me aconseje'],
      mensaje: 'Mensaje', hint: 'Marca y modelo si lo sabes, y qué hace exactamente.',
      priv: 'He leído y acepto la <a href="privacidad.html">política de privacidad</a>. Uso tus datos solo para responderte.', enviar: 'Enviar mensaje',
      asunto: 'Consulta%20ordenador', escribir: 'Escribir', copiar: 'Copiar', guardar: 'Guardar en contactos',
      quien: 'Quién te atiende', conoceme: 'Conóceme'
    },
    tag: 'Reparación y optimización de ordenadores en Madrid', diagnostico: 'Pedir diagnóstico'
  },

  en: {
    title: 'Computer repair and upgrades in Madrid, in English | Alextoll',
    desc: 'English-speaking computer repair in Madrid: cleaning, more RAM and SSD, Windows and Linux installs and tune-ups. Quote before I start. Write to me and I reply myself.',
    ogTitle: 'Alextoll: your computer, like new',
    ogDesc: 'Computer repair and upgrades in Madrid, in English. Cleaning, more RAM and SSD, Windows and Linux. Quote before I touch anything.',
    ogAlt: 'Alextoll, computer repair and upgrades',
    hero: {
      eyebrow: 'Computer repair and upgrades in Madrid, in English', h1: '<span>Your computer,</span> <span class="silver">like new.</span>',
      lede: 'I diagnose, repair and upgrade your computer so it runs like the first day. I tell you what is wrong and how much it costs before touching anything, and we can talk in English.',
      cta: 'Get a quote', sobreMi: 'About me', puntos: ['Honest diagnosis', 'Personal service', 'No-obligation quote'], pausa: 'Pause the background video'
    },
    serv: {
      eyebrow: 'Solutions for your computer', h2: 'Main services',
      nota: 'Everything your computer needs to perform like the first day. Done carefully, with clear explanations.',
      mas: 'More information',
      cards: [
        ['reparacion.webp', 'Repair', 'Won\'t turn on, freezes or restarts. I find the cause before replacing anything and explain what is wrong.', 'computer-repair-madrid'],
        ['ssd-ram.webp', 'SSD / RAM upgrade', 'More speed and smoothness without a new computer: an SSD and memory compatible with your machine.', 'ssd-upgrade-madrid'],
        ['limpieza.webp', 'Cleaning and maintenance', 'Dust out, fresh thermal paste and lower temperatures. A quieter computer that lasts longer.', 'computer-cleaning-madrid'],
        ['sistema.webp', 'Reinstall and system', 'Clean install of Windows or Linux with your files backed up first, set up the way you like.', 'reinstall-windows-linux-madrid']
      ],
      tambien: 'Also: <a href="ram-upgrade-madrid.html">RAM upgrades</a>, programs and software, tune-ups, backups, buying advice and <a href="custom-pc-build-madrid.html">custom PC builds</a>. <a href="#contacto">Ask me</a>.',
      teaser: ['New', 'Need a website for your business?', 'I also design modern websites for small businesses and freelancers, from €99.', 'See web design']
    },
    trust: {
      eyebrow: 'Trust at every step', h2: 'A clear service, no surprises',
      txt: 'I keep you informed the whole time, with a friendly approach and a transparent process. If you don\'t like the quote, nothing gets done.',
      pasos: [['lupa', 'Diagnosis', 'I check your computer and explain what is wrong in plain words.'], ['hoja', 'Quote', 'A fixed price before I start, no obligation.'],
        ['llave', 'Repair', 'I do the work carefully and keep you informed.'], ['ok', 'Hand-over', 'I show you what I have done and give you tips to make it last.']],
      stats: [['personas', 'Personal service', 'You always deal with me'], ['hoja', 'Free quote', 'Before I touch anything'], ['escudo', 'Your data, safe', 'Backup before any wipe'], ['portatil', 'Laptops and desktops', 'Windows or Linux']]
    },
    trab: {
      eyebrow: 'Results that speak', h2: 'Real work', anteriores: 'Previous jobs', mas: 'More jobs', aria: 'Completed jobs',
      pronto: 'Real photo coming soon', antes: 'Before', despues: 'After',
      items: [['Performance boost', 'From a slow computer to a smooth one with an SSD and more RAM.'], ['Full clean', 'Dust out and fresh thermal paste. Lower temperatures.'],
        ['Reinstall and tune-up', 'A clean system, error-free and ready for everyday use.'], ['SSD upgrade', 'An old computer that starts in seconds again.']],
      nota: 'Real before-and-after photos of computers I have worked on, coming soon.'
    },
    op: { eyebrow: 'Reviews', h2: 'What clients say' },
    precios: {
      eyebrow: 'Guide prices', h2: 'Solutions for every need',
      txt: 'Every computer is different. Tell me about yours and I will give you a diagnosis and a fixed quote, with no obligation. Asking costs nothing.',
      cta: 'Get a quote', online: 'Quick online check (in Spanish)',
      tiles: [['limpieza', 'ventilador', 'Cleaning', 'Price'], ['so', 'ventana', 'Reinstall', 'Price'], ['hardware', 'ram', 'SSD / RAM upgrade', 'Price'], ['arreglos', 'llave', 'Repair', 'Depends on the fault']],
      aPresupuesto: 'Quote on request'
    },
    faq: {
      eyebrow: 'Common questions', h2: 'Frequently asked questions', otra: 'Another question? Ask me',
      preguntas: [
        ['How much does it cost?', 'It depends on the problem and the parts. I give you a fixed price after seeing the computer and before starting. Asking and getting a quote is free.'],
        ['How long does it take?', 'A clean or a system install is usually done in one or two days. If parts need ordering, it depends on delivery. I always give you a rough date.'],
        ['Will I lose my files if you wipe it?', 'No, as long as we back up first. I suggest saving your photos, documents and anything important before reinstalling anything.'],
        ['Do I bring the parts or do you get them?', 'Whichever you prefer. I can recommend what to buy so it is compatible with your computer, or get it myself and include it in the quote.'],
        ['Do you work on laptops and desktops?', 'Yes, both, with Windows or Linux. If you have another kind of computer, write to me and I will tell you if I can help.'],
        ['Do you speak English?', 'Yes. You can write to me and talk to me in English, and I explain everything in plain English, without jargon.'],
        ['Where do you work?', 'I work in Madrid, mostly at weekends. You bring it to me or we meet so I can pick it up. Many software and setup issues can be solved remotely.', 'faq-zona']
      ]
    },
    cont: {
      eyebrow: 'Contact', h2: 'Tell me what is wrong with your computer', nota: 'I reply as soon as I can with an idea of what it is and the next step.',
      noRellenar: 'Do not fill in', borrador: 'I have restored what you were writing.', deCero: 'Start over',
      nombre: 'Name', contacto: 'Phone or email', necesitas: 'What do you need?', noSe: ['Not sure', 'Not sure, I would like advice'],
      mensaje: 'Message', hint: 'Make and model if you know them, and exactly what it does.',
      priv: 'I have read and accept the <a href="../privacidad.html" hreflang="es">privacy policy</a> (in Spanish). I only use your details to reply to you.', enviar: 'Send message',
      asunto: 'Computer%20enquiry', escribir: 'Write', copiar: 'Copy', guardar: 'Save to contacts',
      quien: 'Who you will deal with', conoceme: 'Meet me'
    },
    tag: 'Computer repair and upgrades in Madrid', diagnostico: 'Get a quote'
  }
};
